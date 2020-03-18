/* eslint-disable arrow-body-style */
/* eslint-disable consistent-return */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
/* eslint-disable padded-blocks */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable no-undef */

const TerraLogger = require('terra-logger')
const config = require('../../config')
const redis = require('../../redis')
const Utils = require('../../lib/utils')
const ResponseManager = require('../../commons/response')

const subscribeUser = require('../../lib/9Mobile/subscription')
const publish = require('../../rabbitmq/producer')


module.exports = {

async userConsent(req, res) {

    const { msisdn, keyword } = req.body

    const requiredParams = ['msisdn', 'keyword']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length !== 0) {
        return ResponseManager.sendErrorResponse({
            res, message: `Please pass the following parameters for request ${missingFields}`,
        })
    }

    const keywordSanitized = Utils.keywordSanitizer(keyword)

    TerraLogger.debug(keywordSanitized, 'keyword')

    //  save keyword from (request body) in redis - - for user session persistence
    await redis.set(msisdn, keywordSanitized, 'ex', 60 * 5) // 5 mins expiration


    // get the keyword from redis to compare against what we have in config - for validation
    const keywordFromRedis = await redis.getAsync(msisdn).then((rkeyword) => {
        TerraLogger.debug(rkeyword, 'keyword from redis')
         return rkeyword
    }).catch((error) => TerraLogger.debug(error, 'Error getting keyword from redis')) 


    // TODO (still to fix)
    // currently checking for the valid keyword from config
    const validKeyword = config.keywordConfig.find((configs) => {
        if (configs === keywordFromRedis) {
          return true
        }
        return false
      })

   TerraLogger.debug(validKeyword, 'validKeyword')

    // get existing user session from redis to validate user request
    const existingSession = await redis.getAsync(msisdn).then((session) => {
        TerraLogger.debug(session, 'keyword from redis')
        return session
    }).catch((error) => TerraLogger.debug(error, 'Error fetching user session from redis'))

 
     // compare the keyword in the current user session against the valid keyword 
    // (checked from user input as against keyword in the config)
    if (existingSession === validKeyword) {
       
     await Utils.sendUserSessionSMS(msisdn)

     try {
        // get serviceId from keyword saved to redis (to be used for subscription request)
     const serviceId = await Utils.getServiceIdFromKeyword(validKeyword)

     if (keyword === '1') {
 
        try {
    
        const data = await subscribeUser.subscribe({userIdentifier: msisdn, serviceId, entryChannel: 'SMS', userConsent: 1 })
        
            ResponseManager.sendResponse({
                 res,
                 responseBody: data,
             })
             await Utils.sendUserSuccessSMS(msisdn)
 
             await publish(config.rabbit_mq.nineMobile.subscription_queue, data)
             .then((status) => {
             TerraLogger.debug('successfully pushed subscription data to queue', status)
             }).catch((err) => {
             return ResponseManager.sendErrorResponse({
                 res,
                 message: 'unable to push subscription data to queue',
                 responseBody: err,
             })
         })
         } catch (error) {
             TerraLogger.debug(error)
             await Utils.sendUserErrorSMS(msisdn)
             return ResponseManager.sendErrorResponse({
                res,
                message: 'Problem calling the NineMobile subscription engine',
                responseBody: error,
            })        
         }
     } else if (keyword === '2') {
        try {
         const data = await subscribeUser.subscribe({userIdentifier: msisdn, serviceId, entryChannel: 'SMS', userConsent: 2 })
             ResponseManager.sendResponse({
                 res,
                 responseBody: data,
             })
             await Utils.sendUserSuccessSMS(msisdn)
             return publish(config.rabbit_mq.nineMobile.subscription_queue, data)
             .then((status) => {
             TerraLogger.debug('successfully pushed postback data to queue', status)
             }).catch((err) => {
             return ResponseManager.sendErrorResponse({
                 res,
                 message: 'unable to push postback data to queue',
                 responseBody: err,
             })
         }) 
         } catch (error) {
             TerraLogger.debug(error)
             await Utils.sendUserErrorSMS(msisdn)
             return ResponseManager.sendErrorResponse({
                res,
                message: 'Problem calling the NineMobile subscription engine',
                responseBody: error,
            })  
         }
     }    
     } catch (error) {
         return ResponseManager.sendErrorResponse({
            res,
            message: `unable to get serviceId from Redis,   ${error.message}`,
         })
     }  
} else {
    return Utils.sendUserErrorSMS(msisdn)
}
},
}

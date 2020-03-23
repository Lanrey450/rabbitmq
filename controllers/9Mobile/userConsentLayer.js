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
const Utils = require('../../lib/utils')
const ResponseManager = require('../../commons/response')

const subscribeUser = require('../../lib/9Mobile/subscription')
const publish = require('../../rabbitmq/producer')


module.exports = {

async userConsent(req, res) {

    const { msisdn, keyword, shortCode } = req.body

    ResponseManager.sendResponse({
        res, 
        message: 'Thank you! Now go forth',
    })

    const requiredParams = ['msisdn', 'keyword', 'shortCode']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length !== 0) {
        return
    }

    const redisKey = `SUBSCRIPTION_CALL::${shortCode}::${msisdn}`

     try {
        // get serviceId from keyword saved to redis (to be used for subscription request)
     const serviceId = await Utils.getServiceIdFromKeyword(redisKey)

     if (keyword === '1') {
 
        try {
    
        const data = await subscribeUser.subscribe({ userIdentifier: msisdn, serviceId, entryChannel: 'SMS', userConsent: 1 })
        
             Utils.sendUserSuccessSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)

             if (data.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
                await publish(config.rabbit_mq.nineMobile.subscription_queue, { ...data, renewable: true })
                .then(() => {
                TerraLogger.debug('successfully pushed subscription data to queue')
            }).catch((err) => {
                TerraLogger.debug(err)
            })
            }
         } catch (error) {
             TerraLogger.debug(error)
            Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)     
         }
     } else if (keyword === '2') {
        try {
         const data = await subscribeUser.subscribe({ userIdentifier: msisdn, serviceId, entryChannel: 'SMS', userConsent: 2 })

            Utils.sendUserSuccessSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)

            if (data.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
              return publish(config.rabbit_mq.nineMobile.subscription_queue, { ...data, renewable: false })
             .then(() => {
             TerraLogger.debug('successfully pushed postback data to queue')
             }).catch((err) => {
             TerraLogger.debug(err)
         }) 
        }
         } catch (error) {
             TerraLogger.debug(error)
            Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
         }
     }    
     } catch (error) {
        TerraLogger.debug(error)
     }  
},
}

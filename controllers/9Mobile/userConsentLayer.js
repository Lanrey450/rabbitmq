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

    const redisKeyForServiceId = `SUBSCRIPTION_CALL::${shortCode}::${msisdn}`

     try {
        // get serviceId from keyword saved to redis (to be used for subscription request)
     const data = await Utils.getServiceIdFromKeyword(redisKeyForServiceId)


     const result = data.split('::')
     const serviceId = result[0]
     const channel = result[1]


     if (keyword === '1') {
 
        try {
                
                    const response = await subscribeUser.subscribe({
            userIdentifier: msisdn, serviceId: serviceId.trim(), entryChannel: channel.toUpperCase(), userConsent: 1, 
            })

            // format data to push to queue
            const dataToPush = {
                status: 'success',
                network: '9mobile',
                action: config.request_type.sub,
                serviceId,
                msisdn,
                message: response.message,
                meta: {
                    entryChannel: channel,
                    transactionId: response.responseData.transactionId,
                    subscriptionStatus: response.responseData.subscriptionStatus,
                    lastRenewalOkDate: response.responseData.lastRenewalOkDate,
                    lastRenewalNotOkDate: response.responseData.lastRenewalNotOkDate,
                    nextRenewalDate: response.responseData.nextRenewalDate,
                    optinPricepointId: response.responseData.optinPricepointId,
                    subscriptionResult: response.responseData.subscriptionResult,
                    subStatusDate: response.responseData.subStatusDate,
                    subSubStatusDate: response.responseData.subSubStatusDate,
                    subscriptionId: response.responseData.subscriptionId,
                },
            }

        TerraLogger.debug(data, '9Mobile subscription data')

             if (response.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
             Utils.sendUserSuccessSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)

                await publish(config.rabbit_mq.nineMobile.subscription_queue, {
                    ...dataToPush,
                    })
                .then(() => {
                TerraLogger.debug('successfully pushed subscription data to queue')
            }).catch((err) => {
                TerraLogger.debug(err)
            })
            }
            if (response.responseData.subscriptionResult === 'OPTIN_ALREADY_ACTIVE') {
                Utils.sendUserAleadySubSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
            }
         } catch (error) {
             TerraLogger.debug(error.response)
            Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)     
         }
     } else if (keyword === '2') {
        try {
         const response = await subscribeUser.subscribe({
        userIdentifier: msisdn, serviceId: serviceId.trim(), entryChannel: channel.toUpperCase(), userConsent: 2, 
        })

        // format data to push to queue
        const dataToPush = {
            status: 'success',
            network: '9mobile',
            action: config.request_type.sub,
            serviceId,
            msisdn,
            message: response.message,
            meta: {
                entryChannel: channel,
                transactionId: response.responseData.transactionId,
                subscriptionStatus: response.responseData.subscriptionStatus,
                lastRenewalOkDate: response.responseData.lastRenewalOkDate,
                lastRenewalNotOkDate: response.responseData.lastRenewalNotOkDate,
                nextRenewalDate: response.responseData.nextRenewalDate,
                optinPricepointId: response.responseData.optinPricepointId,
                subscriptionResult: response.responseData.subscriptionResult,
                subStatusDate: response.responseData.subStatusDate,
                subSubStatusDate: response.responseData.subSubStatusDate,
                subscriptionId: response.responseData.subscriptionId,
            },
        }

            if (response.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
             Utils.sendUserSuccessSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
              return publish(config.rabbit_mq.nineMobile.subscription_queue, {
                ...dataToPush,
            })
             .then(() => {
             TerraLogger.debug('successfully pushed postback data to queue')
             }).catch((err) => {
             TerraLogger.debug(err)
         }) 
        }
        if (response.responseData.subscriptionResult === 'OPTIN_ALREADY_ACTIVE') {
            Utils.sendUserAleadySubSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
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

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
const NineMobileUtils = require('../../lib/9Mobile/util')
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

    console.log(redisKeyForServiceId, 'redisKeyForServiceId')

     try {
        // get serviceId from keyword saved to redis (to be used for subscription request)
     const data = await Utils.getServiceIdFromKeyword(redisKeyForServiceId)


     const result = data.split('::')
     const serviceId = result[0]
     const channel = result[1]
     result[5] = shortCode
     result[6] = msisdn



     console.log(data, serviceId, channel, result, 'data------------------')  


     if (keyword === '1') {
 
        try {

            console.log('msisdn -', msisdn)
            console.log('serviceId - ', serviceId.trim())
            console.log('entryChannel - ', channel.toUpperCase())
                
                    const response = await subscribeUser.subscribe({
            userIdentifier: msisdn, serviceId: serviceId.trim(), entryChannel: channel.toUpperCase(), userConsent: 1, 
            })

        
            console.log(response, 'response')
            // format data to push to queue
            const dataToPush = {
                status: 'success',
                network: '9mobile',
                action: config.request_type.sub,
                renew: true,
                serviceId,
                msisdn,
                message: response.responseData.subscriptionResult,
                meta: {
                    entryChannel: channel,
                    transactionId: response.responseData.transactionId,
                    externalTxId: response.responseData.externalTxId,
                    subscriptionError: response.responseData.subscriptionError,              
                },
            }

            console.log(dataToPush, 'dataToPush')

        TerraLogger.debug(data, response, '9Mobile subscription data')

             if (response.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
                NineMobileUtils.sendUserAutoRenewalSMS(result).then(TerraLogger.debug).catch(TerraLogger.debug)

                await publish(config.rabbit_mq.nineMobile.subscription_queue, {
                    ...dataToPush,
                    })
                .then(() => {
                TerraLogger.debug('successfully pushed subscription data to queue')
            }).catch((err) => {
                TerraLogger.debug(err)
            })
            } else if (response.responseData.subscriptionResult === 'OPTIN_ALREADY_ACTIVE') {
                NineMobileUtils.sendUserAleadySubSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
            } else {
                Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug) 
            }
         } catch (error) {
             TerraLogger.debug(error.response)
            Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)     
         }
     } else if (keyword === '2') {
        try {
            console.log('msisdn -', msisdn)
            console.log('serviceId - ', serviceId.trim())
            console.log('entryChannel - ', channel.toUpperCase())
         const response = await subscribeUser.subscribe({
        userIdentifier: msisdn, serviceId: serviceId.trim(), entryChannel: channel.toUpperCase(), userConsent: 2, 
        })


        console.log(response, 'response')

        // format data to push to queue
        const dataToPush = {
                status: 'success',
                network: '9mobile',
                action: config.request_type.sub,
                renew: false,
                serviceId,
                msisdn,
                message: response.responseData.subscriptionResult,
                meta: {
                    entryChannel: channel,
                    transactionId: response.responseData.transactionId,
                    externalTxId: response.responseData.externalTxId,
                    subscriptionError: response.responseData.subscriptionError,   
            },
        }

        console.log(dataToPush, 'dataToPush')

            if (response.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
                NineMobileUtils.sendUserOneOffSMS(result).then(TerraLogger.debug).catch(TerraLogger.debug)
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
            return NineMobileUtils.sendUserAleadySubSMS(result).then(TerraLogger.debug).catch(TerraLogger.debug)
        } 
            // Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug) 
        
         } catch (error) {
            TerraLogger.debug(error)
            Utils.sendUserErrorGlobalSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
         }
     }else{
        return NineMobileUtils.sendUserInvalidKeywordSMS(result).then(TerraLogger.debug).catch(TerraLogger.debug)
     }    
     } catch (error) {
        TerraLogger.debug(error)
    }  
},
}

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
const redis = require('../../redis')

module.exports = {

async ussd(req, res) {

    const { msisdn, serviceId,shortCode,productId, consent } = req.body

    console.log('USSSSSDDDD---', req.body)
    ResponseManager.sendResponse({
        res, 
        message: 'Thank you! Now go forth',
    })

    const requiredParams = ['msisdn', 'serviceId','shortCode','productId']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length !== 0) {
        return
    }


     try {
 
     const channel = 'ussd'


     console.log( serviceId, channel, 'data------------------')  


        try {
            console.log('msisdn -', msisdn)
            console.log('serviceId - ', serviceId.trim())
            console.log('entryChannel - ', channel.toUpperCase())
            console.log('productId - ', productId)

         const response = await subscribeUser.subscribe({
        userIdentifier: msisdn, serviceId: serviceId.trim(), entryChannel: channel.toUpperCase() 
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

        const redisSubscriptionKey = `USSD_SUBSCRIPTION_CALL::${serviceId}::${msisdn}`;
        console.log("ussd subscription call key "+ redisSubscriptionKey)
             redis.set(redisSubscriptionKey, `${serviceId}::${channel}::${productId}::${shortCode}::${consent}`, 'ex', 60 * 60 * 24) // save for 24 hours

            if (response.responseData.subscriptionResult === 'OPTIN_ACTIVE_WAIT_CHARGING') {
             //   NineMobileUtils.sendUserOneOffSMS(result).then(TerraLogger.debug).catch(TerraLogger.debug)

            //  const redisSubscriptionKey = `USSD_SUBSCRIPTION_CALL::${serviceId}::${msisdn}`
            //  console.log("ussd subscription call key "+ redisSubscriptionKey)
            //  redis.set(redisSubscriptionKey, `${serviceId}::${channel}::${productId}::${shortCode}::${consent}`, 'ex', 60 * 60 * 24) // save for 24 hours

              return publish(config.rabbit_mq.nineMobile.subscription_queue, {
                ...dataToPush,
            })
             .then(() => {
             TerraLogger.debug('successfully pushed postback data to queue')
             }).catch((err) => {
                console.log(error)
             TerraLogger.debug(err)
         }) 
        }
        if (response.responseData.subscriptionResult === 'OPTIN_ALREADY_ACTIVE') {

               const result = [
                   '','','','','',shortCode,msisdn
               ]

               return publish(config.rabbit_mq.nineMobile.subscription_queue, {
                ...dataToPush,
            })
             .then(() => {
             TerraLogger.debug('successfully pushed postback data to queue')
             }).catch((err) => {
                console.log(error)
             TerraLogger.debug(err)
         }) 

            // return NineMobileUtils.sendUserAleadySubSMS(result).then(TerraLogger.debug).catch(TerraLogger.debug)
        } 
            // Utils.sendUserErrorSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug) 
        
         } catch (error) {
             console.log(error)
            TerraLogger.debug(error)
          //Utils.sendUserErrorGlobalSMS(msisdn, '9Mobile', shortCode).then(TerraLogger.debug).catch(TerraLogger.debug)
         }
     
     } catch (error) {
        console.log(error)
        TerraLogger.debug(error)
    }  
},
}

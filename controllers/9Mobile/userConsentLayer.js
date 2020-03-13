/* eslint-disable arrow-body-style */
/* eslint-disable consistent-return */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
/* eslint-disable padded-blocks */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable no-undef */

const config = require('../../config')
const redis = require('../../redis')
const Utils = require('../../lib/utils')

const subscribeUser = require('../../lib/9Mobile/subscription')
const publish = require('../../rabbitmq/producer')


module.exports = {

async userConsent(req, res) {

    const { msisdn, keyword } = req.body

    await redis.set(msisdn, keyword.trim(), 'ex', 60 * 5) // 5 mins expiration

   const validKeyword = config.keywordConfig.find((configs) => configs === redis.get(msisdn))

   console.log(validKeyword, 'validKeyword')

   const existingSession = await redis.get(msisdn)

     //  get user session cached
    if (existingSession === validKeyword) {
       
     await Utils.sendUserSessionSMS(msisdn)

    if (keyword === '1') {
        // TODO
        // write function to get serviceId from keyword saved to redis in file (/controllers/9Mobile/subscription.js)
        // let serviceId = getServiceIdFromKeyword(validKeyword)
        let serviceId = 'temp'
        const data = await subscribeUser.subscribe(msisdn, serviceId, 'SMS', 1)
        try {
            ResponseManager.sendResponse({
                res,
                responseBody: data,
            })
            await Utils.sendUserSuccessSMS(msisdn)

            return publish(config.rabbit_mq.nineMobile.subscription_queue, data)
		    .then((status) => {
			console.log('successfully pushed subscription data to queue')
			return ResponseManager.sendResponse({
				res,
				message: 'ok',
				responseBody: status,
			})
		    }).catch((err) => {
			return ResponseManager.sendErrorResponse({
				res,
				message: 'unable to push subscription data to queue',
				responseBody: err,
			})
		})
        } catch (error) {
            console.error(error)
            return Utils.sendUserErrorSMS(msisdn)
        }
    } else if (keyword === '2') {
        const data = await subscribeUser.subscribe(msisdn, validKeyword, 'SMS', 2)
        try {
            ResponseManager.sendResponse({
                res,
                responseBody: data,
            })
            await Utils.sendUserSuccessSMS(msisdn)
            return publish(config.rabbit_mq.nineMobile.subscription_queue, data)
		    .then((status) => {
			console.log('successfully pushed postback data to queue')
			return ResponseManager.sendResponse({
				res,
				message: 'ok',
				responseBody: status,
			})
		    }).catch((err) => {
			return ResponseManager.sendErrorResponse({
				res,
				message: 'unable to push postback data to queue',
				responseBody: err,
			})
		}) 
        } catch (error) {
            console.error(error)
            return Utils.sendUserErrorSMS(msisdn)
        }
    }
} else {
    return Utils.sendUserErrorSMS(msisdn)
     }
},
}

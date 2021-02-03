/* eslint-disable no-tabs */
const publish = require('../../rabbitmq/producer')
// const TerraLogger = require('terra-logger')
const config = require('../../config')


const util = require('../../lib/utils')

module.exports = {

	async optin(req, res) {
		console.log('optin request')
		console.log(req.body)

		const data = req.body

		const dataToPush = {

			msisdn: data.userIdentifier,
			status: 'success',
			action: config.request_type.sub,
			meta: {
				mnoDeliveryCode: data.mnoDeliveryCode,
			},
			network: '9mobile',
			serviceId: data.serviceId,
			message: data.operation,
			transactionId: data.transactionUUID,
		}

		try {
			publish(config.rabbit_mq.nineMobile.subscription_queue, { ...dataToPush }) // subscription feedback
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}

		const response = {

			requestId: util.now('micro').toString(),
			
			code:"SUCCESS",
			
			inError: false,
			
			message: "Request processed successfully", "responseData":{}
			
			}
		res.json(response)
		//res.send('ok')


	},

	async optout(req, res) {
		console.log('optout request')
		console.log(req.body)

		const data = req.body

		const dataToPush = {

			msisdn: data.userIdentifier,
			status: 'success',
			action: config.request_type.unsub,
			meta: {
			},
			network: '9mobile',
			serviceId: data.serviceId,
			message: data.operation,
			transactionId: data.transactionUUID,
		}
		try {
			 publish(config.rabbit_mq.nineMobile.un_subscription_queue, { ...dataToPush })  //un-sub 
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}

		const response = {

			requestId: util.now('micro').toString(),
			
			code:"SUCCESS",
			
			inError: false,
			
			message: "Request processed successfully", "responseData":{}
			
			}
		res.json(response)
		//res.send('ok')
	},

	async chargeAsync(req, res) {
		console.log('charge async request')
		console.log(req.body)

		const data = req.body

		const dataToPush = {
			msisdn: data.userIdentifier,
			status: 'success',
			meta: {
			},
			network: '9mobile',
			serviceId: data.serviceId,
			message: data.operation,
			transactionId: data.transactionUUID,
		}
		try {
			publish(config.rabbit_mq.nineMobile.charge_postback_queue, { ...dataToPush }) // charge feedback
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}
		const response = {

			requestId: util.now('micro').toString(),
			
			code:"SUCCESS",
			
			inError: false,
			
			message: "Request processed successfully", "responseData":{}
			
			}
		res.json(response)
		//res.send('ok')
	},

	async consent(req, res) {
		console.log('consent request')
		console.log(req.body)

		const data = req.body

		const dataToPush = {

			msisdn: data.userIdentifier,
			status: 'success',
			meta: {
				validity: data.validity,
				mnoDeliveryCode: data.mnoDeliveryCode,
			},
			network: '9mobile',
			serviceId: data.serviceId,
			message: data.operation,
		}
		try {
			publish(config.rabbit_mq.nineMobile.subscription_queue, { ...dataToPush }) // subscription feedback queue
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}


		const redisKeyForServiceId = `USSD_SUBSCRIPTION_CALL::${dataToPush.serviceId}::${dataToPush.msisdn}`

		console.log(redisKeyForServiceId, 'redisKeyForServiceId')

		let result = await Utils.getServiceIdFromKeyword(redisKeyForServiceId)

		result = result.split('::')
		const serviceId = result[0]
		const channel = result[1]
		const productId = result[2]
		const msisdn = dataToPush.msisdn

						const payload = {
							network: '9mobile',
							serviceId: serviceId,
							msisdn: msisdn,
							channel: channel,
							productId: productId,
							feedbackStatus: true
			
		}
		
		 publish(config.rabbit_mq.vasQueues.SUBSCRIPTION_AND_CHARGE_FALLBACK, {
			...payload,
		})
		 .then(() => {
		 TerraLogger.debug('successfully pushed to subscription queue for charge and billing process')
		 }).catch((err) => {
		 TerraLogger.debug(err)
	 }) 

		const response = {

			requestId: util.now('micro').toString(),
			
			code:"SUCCESS",
			
			inError: false,
			
			message: "Request processed successfully", "responseData":{}
			
			}
		res.json(response)
		//res.send('ok')
	},

	// async mtRequest(req, res) {
	// 	console.log('mt request')
	// 	console.log(req.body)
	// 	try {
	// 		publish(config.rabbit_mq.nineMobile.postback_queue, req.body)
	// 			.then(() => {
	// 				console.log('successfully pushed to the 9MOBILE unsubscription data queue')
	// 			})
	// 	} catch (err) {
	// 		console.log(`unable to push unsubscription data to queue :: ${err}`)
	// 	}

	// 	res.send('ok')
	// },

	// async userRenewedRequest(req, res) {
	// 	console.log('user-renewed request')
	// 	console.log(req.body)
	// 	res.send('ok')
	// },

	// async chargeDOBRequest(req, res) {
	// 	console.log('charge-dob request')
	// 	console.log(req.body)
	// 	res.send('ok')
	// },
}

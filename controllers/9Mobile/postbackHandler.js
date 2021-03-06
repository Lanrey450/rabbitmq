/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger');
const axios = require('axios');
const redis = require('../../redis');
const { promisify } = require("util");

const NineMobileUtils = require('../../lib/9Mobile/util');
const NineMobileChargeApi = require('../../lib/9Mobile/charging')
const publish = require('../../rabbitmq/producer')
const config = require('../../config')


const util = require('../../lib/utils')

redis.getAsync = promisify(redis.get).bind(redis);


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

			code: "SUCCESS",

			inError: false,

			message: "Request processed successfully", "responseData": {}

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

		let cachedDataKey = `UNSUBSCRIPTION_CALL::${data.serviceId}::${data.userIdentifier}`;

		let cachedData = await redis.getAsync(cachedDataKey);
		console.log('unsub cached data', cachedData);

		cachedData = cachedData.split('::');

		const smsData = {
			name: cachedData[0],
			shortCode: cachedData[1],
			keyword: cachedData[2],
			msisdn: data.userIdentifier,
			channel: cachedData[3],
			productName: cachedData[4]

		}

		NineMobileUtils.sendUserUnsubSMS(smsData).then(TerraLogger.debug).catch(TerraLogger.debug)

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

			code: "SUCCESS",

			inError: false,

			message: "Request processed successfully", "responseData": {}

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

		const renewalKey = `RENEW::${data.userIdentifier}::${data.serviceId}`;
		const cachedData = await redis.getAsync(renewalKey);

		console.log('CACHED DATA CHARGE ASYN', cachedData);

		const smsData = {
			amount: cachedData[0],
			validity: cachedData[1],
			serviceName: cachedData[2],
			shortCode: cachedData[3],
			msisdn: data.userIdentifier,
			unSubscriptionKeyword: cachedData[4]
		}

		try {
			if (data.mnoDeliveryCode.toLowerCase() === 'success') {
				//send renewal sms
				NineMobileUtils.sendUserAutoRenewal(smsData).then(TerraLogger.debug).catch(TerraLogger.debug)

			}
			publish(config.rabbit_mq.nineMobile.charge_postback_queue, { ...dataToPush }) // charge feedback
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}
		const response = {

			requestId: util.now('micro').toString(),

			code: "SUCCESS",

			inError: false,

			message: "Request processed successfully", "responseData": {}

		}
		res.json(response)
		//res.send('ok')
	},

	async consent(req, res) {
		console.log('consent request')
		console.log(req.body)

		const data = req.body;

		const redisKeyForServiceId = `USSD_SUBSCRIPTION_CALL:: ${data.serviceId
			}:: ${data.userIdentifier} `

		console.log(redisKeyForServiceId, 'redisKeyForServiceId')

		const cachedData = await redis.getAsync(redisKeyForServiceId);

		console.log('cached consent data', cachedData)

		const channel = 'USSD';

		let consent;
		if (cachedData) {
			consent = cachedData.split('::')[4];
		}

		console.log('consent value', consent);
		const dataToPush = {

			msisdn: data.userIdentifier,
			status: 'success',
			channel: channel,
			feedbackStatus: true,
			meta: {
				validity: data.validity,
				mnoDeliveryCode: data.mnoDeliveryCode,
			},
			network: '9mobile',
			serviceId: data.serviceId,
			message: data.operation,
			consent,
		}

		try {
			publish(config.rabbit_mq.vasQueues.CONSENT_BILLING, { ...dataToPush }) // subscription feedback queue
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')

				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue:: ${err} `)
		}
		// }


		const response = {

			requestId: util.now('micro').toString(),

			code: "SUCCESS",

			inError: false,

			message: "Request processed successfully", "responseData": {}

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
	// 		console.log(`unable to push unsubscription data to queue:: ${ err } `)
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

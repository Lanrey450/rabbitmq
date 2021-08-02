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

const _axios = axios.create({
	baseURL: notificationUrl,
	headers: {
		'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7ImVtYWlsVmVyaWZpZWRBdCI6IjIwMjAtMDEtMTBUMTQ6NDQ6MDkuNDI1WiIsInBob25lVmVyaWZpZWRBdCI6bnVsbCwiZW1haWwiOiJwYWpldDU4NTk2QG1haWxvbi53cyIsInJvbGUiOiJwcm9kdWN0LXByb3ZpZGVyIiwidXNlcklkIjoiNWUxODdlMWU3ZmVkMDMwMDFiNmJkZTE0Iiwibm90aWZpY2F0aW9uTGFzdFJlYWRBdCI6IjIwMjAtMDEtMjNUMTE6NTY6MDEuMzczWiIsImF1dGhJZCI6IjVlMTg3ZTFlN2ZlZDAzMDAxYjZiZGUxNSIsInByb2ZpbGUiOnsiaXNBY3RpdmUiOnRydWUsImFwcHJvdmVkIjp0cnVlLCJzdGF0dXMiOnRydWUsImNyZWF0ZWRCeSI6bnVsbCwiYXZhdGFyIjoiNWFlNWZkZTAtMzNhZS0xMWVhLWEyMjItYmY3YTk0MTA0MjkxIiwibmFtZSI6IlBhdGVrIFl1c2hudWsiLCJlbWFpbCI6InBhamV0NTg1OTZAbWFpbG9uLndzIiwiZGVzY3JpcHRpb24iOiJMb3JlbSBJcHN1bSBpcyBzaW1wbHkgZHVtbXkgdGV4dCBvZiB0aGUgcHJpbnRpbmcgYW5kIHR5cGVzZXR0aW5nIGluZHVzdHJ5LiBMb3JlbSBJcHN1bSBoYXMgYmVlbiB0aGUgaW5kdXN0cnkncyBzdGFuZGFyZCBkdW1teSB0ZXh0IGV2ZXIgc2luY2UgdGhlIDE1MDBzLCB3aGVuIGFuIHVua25vd24gcHJpbnRlciB0b29rIGEgZ2FsbGV5IG9mIHR5cGUgYW5kIHNjcmFtYmxlZCBpdCB0byBtYWtlIGEgdHlwZSBzcGVjaW1lbiBib29rLiBJdCBoYXMgc3Vydml2ZWQgbm90IG9ubHkgZml2ZSBjZW50dXJpZXMsIGJ1dCBhbHNvIHRoZSBsZWFwIGludG8gZWxlY3Ryb25pYyB0eXBlc2V0dGluZywgcmVtYWluaW5nIGVzc2VudGlhbGx5IHVuY2hhbmdlZC4gSXQgd2FzIHBvcHVsYXJpc2VkIGluIHRoZSAxOTYwcyB3aXRoIHRoZSByZWxlYXNlIG9mIExldHJhc2V0IHNoZWV0cyBjb250YWluaW5nIExvcmVtIElwc3VtIHBhc3NhZ2VzLCBhbmQgbW9yZSByZWNlbnRseSB3aXRoIGRlc2t0b3AgcHVibGlzaGluZyBzb2Z0d2FyZSBsaWtlIEFsZHVzIFBhZ2VNYWtlciBpbmNsdWRpbmcgdmVyc2lvbnMgb2YgTG9yZW0gSXBzdW0uIiwiY2FjTnVtYmVyIjoiUk4xMTExMTExMSIsImFkZHJlc3MiOiIxMiwgYmh1aWsgc3RyZWV0IiwicGhvbmVOdW1iZXIiOjIzNDgwOTg3NjU2NzYsImNyZWF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6Mzc6MzQuNzQ3WiIsInVwZGF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6NDk6MjIuMTgwWiIsInByb3ZpZGVySWQiOiI1ZTE4N2UxZTdmZWQwMzAwMWI2YmRlMTQifSwibm90aWZpY2F0aW9ucyI6W10sInJlZGlyZWN0VG8iOm51bGx9LCJpYXQiOjE1ODQzNjQzNDYsImF1ZCI6InZhcy1hZ2ciLCJpc3MiOiJ2YXMtYXV0aCIsInN1YiI6InZhcy1hZ2cifQ.cmOsu6YLWNZLT9xO6h1srYizh_PoIQ5LnTfZr4DtSB0fnJZNFJLjT4ibsRpwVKKzeMSQYaLouARNgBgoM6EMNg"
	}
})

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
			channel: cachedData[3]

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

		if (req.body.operation === 'USER_RENEW_CONSENT') {

			const response = {

				requestId: util.now('micro').toString(),

				code: "SUCCESS",

				inError: false,

				message: "Request processed successfully", "responseData": {}

			}
			res.json(response)


			const { userIdentifier, serviceId } = req.body;

			console.log('subservice url', process.env.SUBSCRIPTION_SERVICE_UR)
			const url = `${process.env.SUBSCRIPTION_SERVICE_URL}/v1/get-active-by-serviceId`;
			// get active subscription
			const subscription = (await axios.get(url,
				{
					params: { subscriberId: userIdentifier, serviceId },

				})).data.data;

			// const config = await axios.get(url,
			// 	{
			// 		headers: {
			// 			'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7ImVtYWlsVmVyaWZpZWRBdCI6IjIwMjAtMDEtMTBUMTQ6NDQ6MDkuNDI1WiIsInBob25lVmVyaWZpZWRBdCI6bnVsbCwiZW1haWwiOiJwYWpldDU4NTk2QG1haWxvbi53cyIsInJvbGUiOiJwcm9kdWN0LXByb3ZpZGVyIiwidXNlcklkIjoiNWUxODdlMWU3ZmVkMDMwMDFiNmJkZTE0Iiwibm90aWZpY2F0aW9uTGFzdFJlYWRBdCI6IjIwMjAtMDEtMjNUMTE6NTY6MDEuMzczWiIsImF1dGhJZCI6IjVlMTg3ZTFlN2ZlZDAzMDAxYjZiZGUxNSIsInByb2ZpbGUiOnsiaXNBY3RpdmUiOnRydWUsImFwcHJvdmVkIjp0cnVlLCJzdGF0dXMiOnRydWUsImNyZWF0ZWRCeSI6bnVsbCwiYXZhdGFyIjoiNWFlNWZkZTAtMzNhZS0xMWVhLWEyMjItYmY3YTk0MTA0MjkxIiwibmFtZSI6IlBhdGVrIFl1c2hudWsiLCJlbWFpbCI6InBhamV0NTg1OTZAbWFpbG9uLndzIiwiZGVzY3JpcHRpb24iOiJMb3JlbSBJcHN1bSBpcyBzaW1wbHkgZHVtbXkgdGV4dCBvZiB0aGUgcHJpbnRpbmcgYW5kIHR5cGVzZXR0aW5nIGluZHVzdHJ5LiBMb3JlbSBJcHN1bSBoYXMgYmVlbiB0aGUgaW5kdXN0cnkncyBzdGFuZGFyZCBkdW1teSB0ZXh0IGV2ZXIgc2luY2UgdGhlIDE1MDBzLCB3aGVuIGFuIHVua25vd24gcHJpbnRlciB0b29rIGEgZ2FsbGV5IG9mIHR5cGUgYW5kIHNjcmFtYmxlZCBpdCB0byBtYWtlIGEgdHlwZSBzcGVjaW1lbiBib29rLiBJdCBoYXMgc3Vydml2ZWQgbm90IG9ubHkgZml2ZSBjZW50dXJpZXMsIGJ1dCBhbHNvIHRoZSBsZWFwIGludG8gZWxlY3Ryb25pYyB0eXBlc2V0dGluZywgcmVtYWluaW5nIGVzc2VudGlhbGx5IHVuY2hhbmdlZC4gSXQgd2FzIHBvcHVsYXJpc2VkIGluIHRoZSAxOTYwcyB3aXRoIHRoZSByZWxlYXNlIG9mIExldHJhc2V0IHNoZWV0cyBjb250YWluaW5nIExvcmVtIElwc3VtIHBhc3NhZ2VzLCBhbmQgbW9yZSByZWNlbnRseSB3aXRoIGRlc2t0b3AgcHVibGlzaGluZyBzb2Z0d2FyZSBsaWtlIEFsZHVzIFBhZ2VNYWtlciBpbmNsdWRpbmcgdmVyc2lvbnMgb2YgTG9yZW0gSXBzdW0uIiwiY2FjTnVtYmVyIjoiUk4xMTExMTExMSIsImFkZHJlc3MiOiIxMiwgYmh1aWsgc3RyZWV0IiwicGhvbmVOdW1iZXIiOjIzNDgwOTg3NjU2NzYsImNyZWF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6Mzc6MzQuNzQ3WiIsInVwZGF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6NDk6MjIuMTgwWiIsInByb3ZpZGVySWQiOiI1ZTE4N2UxZTdmZWQwMzAwMWI2YmRlMTQifSwibm90aWZpY2F0aW9ucyI6W10sInJlZGlyZWN0VG8iOm51bGx9LCJpYXQiOjE1ODQzNjQzNDYsImF1ZCI6InZhcy1hZ2ciLCJpc3MiOiJ2YXMtYXV0aCIsInN1YiI6InZhcy1hZ2cifQ.cmOsu6YLWNZLT9xO6h1srYizh_PoIQ5LnTfZr4DtSB0fnJZNFJLjT4ibsRpwVKKzeMSQYaLouARNgBgoM6EMNg"
			// 		},
			// 		params: { productId: subscription.productId }
			// 	});

			console.log('TEMP SUB HERE', JSON.stringify(subscription));

			// console.log('TEMP CONFIG HERE', JSON.stringify(config));


			return;
			// if (subscription) {
			// 	const nineMobileRequestBody = {
			// 		"userIdentifier": userIdentifier,
			// 		"serviceId": serviceId,
			// 		"context": "STATELESS",
			// 	}

			// 	const data = await NineMobileChargeApi.sync(nineMobileRequestBody);

			// 	// const responseStatus = data.code.toLowerCase();

			// 	const responseStatus = 'success';

			// 	const smsData = {
			// 		shortCode: config['9mobile'].shortCode,
			// 		unsubKeyword: config['9mobile'].unsubscriptionKeyword,
			// 		validity: subscription.validity,
			// 		amount: subscription.amount,
			// 		serviceName: subscription.product.productName,
			// 	}

			if (responseStatus === 'success') {
				NineMobileUtils.sendUserAutoRenewalUSSD(smsData).then(TerraLogger.debug).catch(TerraLogger.debug);
				return NineMobileUtils.sendUserBillingSMS(smsData).then(TerraLogger.debug).catch(TerraLogger.debug)
			}

			// 	if (responseStatus === 'no_balance') {
			// 		return NineMobileUtils.sendUserlowBalanceSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)

			// 	}

			// 	return;

			// }


			//charge user

			console.log(urlResponse)

			if (urlResponse) {
				//send user renewal message
			}

			return;
		}

		const redisKeyForServiceId = `USSD_SUBSCRIPTION_CALL:: ${data.serviceId
			}:: ${data.userIdentifier} `

		console.log(redisKeyForServiceId, 'redisKeyForServiceId')

		const cachedData = await redis.getAsync(redisKeyForServiceId);

		console.log('cached consent data', cachedData)

		const channel = 'USSD'


		if (cachedData) {
			const consent = cachedData.split('::')[4];

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

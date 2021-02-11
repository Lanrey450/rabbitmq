/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger');
const axios = require('axios')
const NineMobileUtils = require('../../lib/9Mobile/util');
const publish = require('../../rabbitmq/producer')
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

		const redisKeyForServiceId = `USSD_SUBSCRIPTION_CALL::${data.serviceId}::${data.userIdentifier}`

		console.log(redisKeyForServiceId, 'redisKeyForServiceId')

		const shortCode = redisKeyForServiceId.split('::')[3];

		const channel = 'USSD'

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
		}

	

		
		try {

			const planDetails = await axios.get(`http://staging-api-gateway.terragonbase.com/products/api/v1/plans/query?serviceId=${data.serviceId}&network=9mobile`, {
				headers: {
					'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7ImVtYWlsVmVyaWZpZWRBdCI6bnVsbCwicGhvbmVWZXJpZmllZEF0IjpudWxsLCJ1c2VySWQiOiI1ZGY3ODQzMThhNDdlNDAwMWJlZTU4MjciLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHRlbGVjb21tZS5jb20iLCJub3RpZmljYXRpb25MYXN0UmVhZEF0IjoiMjAyMC0wMy0xMlQxMjoyMzo0NC4yMTRaIiwiYXV0aElkIjoiNWRmNzg0MzI4YTQ3ZTQwMDFiZWU1ODJhIiwicHJvZmlsZSI6eyJuYW1lIjoiVGVsZWNvbW1lIEFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZWxlY29tbWUuY29tIiwicGhvbmVOdW1iZXIiOiIrMjM0NzAxMjM0NTY3OCIsInVzZXJJZCI6IjVkZjc4NDMxOGE0N2U0MDAxYmVlNTgyNyJ9LCJub3RpZmljYXRpb25zIjpbeyJkZXNjcmlwdGlvbiI6IkFjY291bnQgQXBwcm92YWxzOiAyIHByb3ZpZGVyKHMpIGFyZSBhd2FpdGluZyBhcHByb3ZhbCIsImxldmVsIjoid2FybmluZyJ9XSwidW5yZWFkIjp7InRpY2tldHMiOjAsInByb2R1Y3RzIjoxNTR9fSwiaWF0IjoxNTg1Mzg0Nzg2LCJhdWQiOiJ2YXMtYWdnIiwiaXNzIjoidmFzLWF1dGgiLCJzdWIiOiJ2YXMtYWdnIn0.T5H42csX4L4rVM9Om9fr_fNulZU8vSCeC-jif-tm-XS96Z5Ncq0Npv_fHnw78S5Uq6uJW9gK-AMfvPFfkWBsZg"
				}
			});

			console.log('PLan', planDetails.data.data);

			const { plan, name } = planDetails.data.data;

			const messagePayload  = { msisdn: data.userIdentifier, name, amount: plan.amount, validity: plan.validity, shortCode };

			console.log('message body', messagePayload);
			NineMobileUtils.sendUserWelcomeSMSforUSSD(messagePayload).then(TerraLogger.debug).catch(TerraLogger.debug)


			publish(config.rabbit_mq.vasQueues.CONSENT_BILLING, { ...dataToPush }) // subscription feedback queue
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

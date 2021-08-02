/* eslint-disable max-len */
/* eslint-disable no-tabs */

const TerraLogger = require('terra-logger')
const { promisify } = require("util");
const ResponseManager = require('../../commons/response')
const NineMobileChargeApi = require('../../lib/9Mobile/charging')
const Utils = require('../../lib/utils')
const NineMobileUtils = require('../../lib/9Mobile/util')
const config = require('../../config')
const publish = require('../../rabbitmq/producer')
const redis = require('../../redis')

redis.getAsync = promisify(redis.get).bind(redis);


module.exports = {
	async chargeSync(req, res) {
		const auth = req.headers.authorization
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		console.log('req body for charge', req.body)
		const requiredParams = ['msisdn', 'serviceId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)
		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for post request: ${missingFields}`,
			})
		}
		const authDetails = auth.split(' ')
		const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
		const credentials = rawAuth.split(':')
		const username = credentials[0]
		const rawPassword = credentials[1]
		// eslint-disable-next-line max-len
		// eslint-disable-next-line eqeqeq
		if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
			try {
				const nineMobileRequestBody = {
					"userIdentifier": req.body.msisdn,
					"serviceId": req.body.serviceId,
					"context": "STATELESS",
					// context: 'SUBSCRIPTION',

				}

				console.log(nineMobileRequestBody, '9Mobile request body')
				// const data = await NineMobileChargeApi.sync(nineMobileRequestBody)

				console.log(data, '9Mobile response')

				// format data to push to queue
				// const dataToPush = {
				// 	status: data.code.toLowerCase(),
				// 	network: '9mobile',
				// 	transactionId: data.responseData.transactionUUID,
				// 	serviceId: nineMobileRequestBody.serviceId,
				// 	msisdn: nineMobileRequestBody.userIdentifier,
				// 	// message: data.message,
				// 	meta: {
				// 		// result: data.responseData.result,
				// 		requestId: data.requestId,
				// 		code: data.code,
				// 		inError: data.inError,
				// 	},
				// }


				// const responseStatus = data.code.toLowerCase();

				if (req.body.renewal) {

					console.log('RENEWAL HERE');

					return ResponseManager.sendResponse({
						res,
						responseBody: {},
					})

				}

				if (req.body.channel.toLowerCase() === 'ussd') {
					const consentRedisKey = `consentString::${req.body.msisdn}`;

					const cachedData = await redis.getAsync(consentRedisKey);

					console.log('cached data for charge', cachedData);

					const services = ['', 'Service Bouquet',];
					const unsubKey = ['', 'STOP SB',];

					req.body.name = services[cachedData];
					req.body.unsubKey = unsubKey[cachedData]

				}

				if (req.body.channel.toLowerCase() === 'sms') {

					const consentRedisKey = `consentStringSMS::${req.body.msisdn}`;
					const cachedData = await redis.getAsync(consentRedisKey);

					const result = cachedData.split(',');

					console.log('resulllrllrl', result);

					req.body.result = result;
					req.body.consent = result[7];

				}

				if (responseStatus === 'success') {
					if (req.body.channel.toLowerCase() === 'ussd') {
						NineMobileUtils.sendUserSuccessMessageForUSSDSub(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)
					}

					if (req.body.channel.toLowerCase() === 'sms') {
						if (req.body.consent == '1') {
							NineMobileUtils.sendUserAutoRenewalSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)

						} else if (req.body.consent == '2') {
							NineMobileUtils.sendUserOneOffSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)
						}
					}

					NineMobileUtils.sendUserBillingSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)
				} else if (responseStatus === 'no_balance') {
					NineMobileUtils.sendUserlowBalanceSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)

					return ResponseManager.sendResponse({
						res,
						responseBody: {},
					})

				}

				console.log(dataToPush, 'dataToPush')

				await publish(config.rabbit_mq.nineMobile.charge_postback_queue, { ...dataToPush })
					.then(() => {
						TerraLogger.debug('successfully pushed charging data to queue')
						return ResponseManager.sendResponse({
							res,
							responseBody: dataToPush,
						})
					}).catch((err) => ResponseManager.sendErrorResponse({
						res,
						message: err.message,
					}))
			} catch (error) {
				TerraLogger.debug(error)
				return ResponseManager.sendErrorResponse({ res, message: `Unable to reach the 9mobile server - ${error}` })
			}
		}
		else {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

	},


	async chargeAsync(req, res) {
		const auth = req.headers.authorization
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}
		const requiredParams = ['msisdn', 'serviceId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)
		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for post request:   ${missingFields}`,
			})
		}

		const authDetails = auth.split(' ')
		const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
		const credentials = rawAuth.split(':')
		const username = credentials[0]
		const rawPassword = credentials[1]
		// eslint-disable-next-line max-len
		// eslint-disable-next-line eqeqeq
		if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
			try {
				const nineMobileRequestBody = {
					userIdentifier: req.body.msisdn,
					serviceId: req.body.serviceId,
					context: 'RENEW',
				}

				// console.log(nineMobileRequestBody, 'req.body to 9Mobile')
				const data = await NineMobileChargeApi.async(nineMobileRequestBody)

				// console.log(data, 'response from 9Mobile')

				//  format data to push to queue
				// const dataToPush = {
				// 	status: 'success',
				// 	network: '9mobile',
				// 	transactionId: data.responseData.transactionUUID,
				// 	serviceId: nineMobileRequestBody.serviceId,
				// 	msisdn: nineMobileRequestBody.userIdentifier,
				// 	message: data.message,
				// 	meta: {
				// 		result: data.responseData.result,
				// 		requestId: data.requestId,
				// 		code: data.code,
				// 		inError: data.inError,
				// 	},
				// }


				// console.log(dataToPush, 'dataToPush')

				// return publish(config.rabbit_mq.nineMobile.charge_postback_queue, { ...dataToPush })
				// 	.then(() => {
				// 		TerraLogger.debug('successfully pushed charging data to queue')
				return ResponseManager.sendResponse({
					res,
					responseBody: data,
				})
				// })
				// .catch((err) => ResponseManager.sendErrorResponse({
				// 	res,
				// 	message: err.message,
				// }))
			} catch (error) {
				TerraLogger.debug(error)
				return ResponseManager.sendErrorResponse({ res, message: `Unable to reach 9mobile server - ${error}` })
			}
		}
		return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},
}





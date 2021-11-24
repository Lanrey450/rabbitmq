/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable indent */
/* eslint-disable space-before-blocks */
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable no-tabs */

const TerraLogger = require('terra-logger')
const ResponseManager = require('../../commons/response')
const NineMobileApi = require('../../lib/9Mobile/subscription')
const Utils = require('../../lib/utils')
const NineMobileUtils = require('../../lib/9Mobile/util')
const config = require('../../config')
const publish = require('../../rabbitmq/producer')
const redis = require('../../redis')


module.exports = {
	async subscribe(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const authDetails = auth.split(' ')

		const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

		const credentials = rawAuth.split(':')
		const username = credentials[0]
		const rawPassword = credentials[1]


		const { msisdn, shortCode, serviceId, channel, amount, validity, name } = req.body

		const requiredParams = ['msisdn', 'shortCode', 'serviceId', 'channel']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for post request ${missingFields}`,
			})
		}

		// save to redis(rediskey = shortcode + msisdn, and redisValue = serviceId)
		// redis.set(`SUBSCRIPTION_CALL::${shortCode}::${msisdn}`, `${serviceId}::${channel}::${amount}::${validity}::${name}`, 'ex', 60 * 60 * 24) // save for 24 hours

		const redisSubscriptionKey = `SUBSCRIPTION_CALL::${shortCode}::${msisdn}`
		console.log("subscription call key " + redisSubscriptionKey)
		redis.set(redisSubscriptionKey, `${serviceId}::${channel}::${amount}::${validity}::${name}`, 'ex', 60 * 60 * 24) // save for 24 hours

		let consentUrlRedisKey = `CONSENT_URL::${shortCode}::${msisdn}::${channel.toLowerCase()}`


		redis.set(consentUrlRedisKey, `${config.baseURL}/nineMobile/sms/mo`, 'ex', 60 * 10) // save for 10 mins



		console.log(consentUrlRedisKey, 'consent-url')

		console.log("channel is ", channel)


		// eslint-disable-next-line padded-blocks
		if (username === config.userAuth.username && rawPassword === config.userAuth.password) {
			try {

				console.log('AUTH INNN')

				if (channel.toLowerCase() == 'sms') {
					NineMobileUtils.sendUserConsentSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)
				}

				return ResponseManager.sendResponse({ res, message: `Consent message successfully sent to the user with msisdn, ${msisdn}` })
			} catch (error) {

				console.log(error)
				return ResponseManager.sendErrorResponse({ res, message: `Unable to send message to user - ${error}` })
			}

		}
		return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},


	async unsubscribe(req, res) {
		const auth = req.headers.authorization;

		console.log('REQUESTTSTS bODY', req.body);

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'channel', 'serviceId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for post request:  ${missingFields}`,
			})
		}

		const authDetails = auth.split(' ')

		const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

		const credentials = rawAuth.split(':')
		const username = credentials[0]
		const rawPassword = credentials[1]


		if (username === config.userAuth.username && rawPassword === config.userAuth.password) {
			//------HACK--------
			const { name, shortCode, keyword, serviceId, productName } = req.body;
			const redisSubscriptionKey = `UNSUBSCRIPTION_CALL::${serviceId}::${req.body.msisdn}`;
			console.log("ussd subscription call key " + redisSubscriptionKey)
			redis.set(redisSubscriptionKey, `${name}::${shortCode}::${keyword}::${req.body.channel}::${productName}`, 'ex', 60 * 60) // save for 1 hour

			//------HACK--------
			try {
				const nineMobileReqBody = {
					userIdentifier: req.body.msisdn,
					entryChannel: req.body.channel.toUpperCase(),
					serviceId: req.body.serviceId,
				}

				console.log("unsub req to 9mobile", nineMobileReqBody)

				const unsubscriptionResponse = await NineMobileApi.unsubscribe(nineMobileReqBody)

				console.log("response from 9mobile", unsubscriptionResponse)
				// if (unsubscriptionResponse && !unsubscriptionResponse.inError) {
				if (unsubscriptionResponse) {

					TerraLogger.debug('unsubscription engine for 9Mobile called...')

					if(req.body.multipleUnsubscription !== 'true'){
						NineMobileUtils.sendUserUnsubSMS(req.body).then(TerraLogger.debug).catch(TerraLogger.debug)
					}

					// format data to push to queue
					const dataToPush = {
						status: 'success',
						network: '9mobile',
						action: config.request_type.unsub,
						serviceId: nineMobileReqBody.serviceId,
						msisdn: nineMobileReqBody.userIdentifier,
						message: unsubscriptionResponse.responseData.subscriptionResult,
						meta: {
							transactionId: unsubscriptionResponse.responseData.transactionId,
							entryChannel: nineMobileReqBody.entryChannel,
							externalTxId: unsubscriptionResponse.responseData.externalTxId,
							subscriptionError: unsubscriptionResponse.responseData.subscriptionError,
						},
					}



					try {
						return publish(config.rabbit_mq.nineMobile.un_subscription_queue, { ...dataToPush })
							.then(() => {
								TerraLogger.debug('successfully pushed to the 9MOBILE unsubscription data queue')
								return ResponseManager.sendResponse({
									res,
									responseBody: dataToPush,
								})
							})
					} catch (err) {
						TerraLogger.debug(err)
						return ResponseManager.sendErrorResponse({
							res,
							message: `unable to push unsubscription data to queue :: ${err}`,
						})
					}
				} else {
					return ResponseManager.sendResponse({
						res,
						responseBody: {},
					})
				}
			} catch (error) {
				TerraLogger.debug(error)
				return ResponseManager.sendErrorResponse({
					res,
					message: error.message,
				})
			}
		}
		return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},

	async status(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'channel', 'serviceId']
		const missingFields = Utils.authenticateParams(req.query, requiredParams)

		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for query request: ${missingFields}`,
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
				const nineMobileReqQuery = {
					userIdentifier: req.query.msisdn,
					entryChannel: req.query.channel,
					serviceId: req.query.serviceId,
				}
				const response = await NineMobileApi.status(nineMobileReqQuery)
				return ResponseManager.sendResponse({
					res,
					responseBody: response,
				})
			} catch (error) {
				TerraLogger.debug(error)
				return ResponseManager.sendErrorResponse({
					res,
					message: error.message,
				})
			}
		}
		return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},

	async getIt(req, res) {
		console.log('YEYEYYEY', req.query)
		const data = await Utils.getSubscription(req.query);

		console.log('RESULT', data);
		return ResponseManager.sendResponse({
			res,
			responseBody: data,
		})
	}
}

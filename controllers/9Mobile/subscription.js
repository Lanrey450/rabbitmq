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


			const { msisdn, shortCode, serviceId } = req.body

			const requiredParams = ['msisdn', 'shortCode', 'serviceId']
			const missingFields = Utils.authenticateParams(req.body, requiredParams)

			if (missingFields.length !== 0){
				return ResponseManager.sendErrorResponse({
					res, message: `Please pass the following parameters for post request ${missingFields}`,
				})
			}

			// save to redis(rediskey = shortcode + msisdn, and redisValue = serviceId)
			redis.set(`SUBSCRIPTION_CALL::${shortCode}::${msisdn}`, serviceId, 'ex', 60 * 60 * 24) // save for 24 hours

			redis.set(`CONSENT_URL::${shortCode}::${msisdn}`, `${config.baseURL}/nineMobile/sms/mo`, 'ex', 60 * 10) // save for 10 mins

			// eslint-disable-next-line padded-blocks
			if (username === config.userAuth.username && rawPassword === config.userAuth.password) {
				try {
				Utils.sendUserConsentSMS(msisdn, '9Mobile', shortCode)
				.then(TerraLogger.debug).catch(TerraLogger.debug)

				return ResponseManager.sendResponse({ res, message: `Consent message successfully sent to the user with msisdn, ${msisdn}` })
				} catch (error) {
				return ResponseManager.sendErrorResponse({ res, message: `Unable to send message to user - ${error}` })
				}
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
 },


	async unsubscribe(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'channel', 'serviceId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		if (missingFields.length !== 0){
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
				try {
					const nineMobileReqBody = {
						userIdentifier: req.body.msisdn,
						entryChannel: req.body.channel,
						serviceId: req.body.serviceId,
					}

					const unsubscriptionResponse = await NineMobileApi.unsubscribe(nineMobileReqBody)
					if (unsubscriptionResponse) {
						TerraLogger.debug('unsubscription engine for 9Mobile called...')
						// push subscription data to queue
						try {
							return publish(config.rabbit_mq.nineMobile.un_subscription_queue, { ...unsubscriptionResponse })
								.then(() => {
									TerraLogger.debug('successfully pushed to the 9MOBILE unsubscription data queue')
								return ResponseManager.sendResponse({
										res,
										responseBody: unsubscriptionResponse,
									})
								})
						} catch (err) {
							TerraLogger.debug(err)
							return	ResponseManager.sendErrorResponse({
								res,
								message: `unable to push unsubscription data to queue :: ${err}`,
							})
						}
					}
				} catch (error) {
					TerraLogger.debug(error)
					return ResponseManager.sendErrorResponse({ res,
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

		if (missingFields.length !== 0){
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
}

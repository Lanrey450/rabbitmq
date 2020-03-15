/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable indent */
/* eslint-disable space-before-blocks */
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable no-tabs */

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


			const { msisdn, channel, keyword, shortCode, serviceId } = req.body

			const requiredParams = ['msisdn', 'channel', 'keyword', 'shortCode', 'serviceId']
			const missingFields = Utils.authenticateParams(req.body, requiredParams)

			// save to redis(rediskey = keyword, and redisValue = serviceId)
			await redis.set(keyword, serviceId, 'ex', 60 * 60 * 24) // save keyword for 24 hours

			// eslint-disable-next-line padded-blocks
			if (username === config.userAuth.username && rawPassword === config.userAuth.password) {

				if (missingFields.length !== 0){
					return ResponseManager.sendErrorResponse({
						res, message: `Please pass the following parameters for request ${missingFields}`,
					})
				}
				try {
					await Utils.sendUserConsentSMS(msisdn, keyword, channel)
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
				res, message: `Please pass the following parameters for request:${missingFields}`,
			})
		}

			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			// eslint-disable-next-line max-len
			// eslint-disable-next-line eqeqeq
			if (username == config.userAuth.username && rawPassword == config.userAuth.password) {
				try {
					const nine_mobile_req_body = {
						userIdentifier: req.body.msisdn,
						entryChannel: req.body.channel,
						serviceId: req.body.serviceId,
					}
					const unsubscriptionResponse = await NineMobileApi.unsubscribe(nine_mobile_req_body)
					if (unsubscriptionResponse) {
						console.info('unsubscription engine for 9Mobile called...')
						// push subscription data to queue
						try {
							publish(config.rabbit_mq.nineMobile.un_subscription_queue, unsubscriptionResponse)
								.then((status) => {
									console.info(`successfully pushed to the 9MOBILE unsubscription data queue: ${status}`)
								return ResponseManager.sendResponse({
										res,
										message: 'Unsubscription was successful',
										responseBody: unsubscriptionResponse,
									})
								})
						} catch (err) {
							return	ResponseManager.sendErrorResponse({
								res,
								message: 'unable to push unsubscription data to queue',
								responseBody: err,
							})
						}
					}
				} catch (error) {
					return ResponseManager.sendErrorResponse({ res,
					message: 'unsubscription failed',
					responseBody: {
						error: true,
						message: error.message,
					} })
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
				res, message: `Please pass the following parameters for request:${missingFields}`,
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
					const response = await NineMobileApi.status(req.query)
					return ResponseManager.sendResponse({
						res,
						responseBody: response.data,
					})
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						responseBody: {
                            error: true,
                            message: error.message,
                        },
					})
				}
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},
}

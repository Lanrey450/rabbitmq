/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable valid-typeof */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger')
const SubscriptionService = require('../../lib/airtel/subscription')
const config = require('../../config')
const ResponseManager = require('../../commons/response')
const publish = require('../../rabbitmq/producer')


const Utils = require('../../lib/utils')


module.exports = {

	// eslint-disable-next-line no-tabs
	/**
     * This subscribes a user to a service on Airtel SE
     *
     * @param req
     * @param res
     * @methodVerb POST
     */
	subscribeRequest(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'productId', 'channel']

		const airtelReqBody = {
			msisdn: req.body.msisdn,
			channel: req.body.channel,
			service: {
				product: {
					productId: req.body.productId,
				},
			},
		}

		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for request:  ${missingFields}`,
			})
		}

			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username === config.userAuth.username && rawPassword === config.userAuth.password) {
				if (!config.airtel_options.allowed_channels.includes(req.body.channel.toUpperCase())) {
					return ResponseManager.sendErrorResponse({ res, message: 'unavailable channel at this time!' })
				}
				return this.subscribeUser(airtelReqBody)
					.then((response) => {
						TerraLogger.debug(response)
						if (response.error) {
							return ResponseManager.sendErrorResponse({ res, message: response.message })
						}
						if (response.data) {
							return ResponseManager.sendResponse({ res, responseBody: response.data })
						}
					}).catch((error) => ResponseManager.sendErrorResponse({ res, message: error.message }))
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},

	/**
       * This is a method use to subcribe user
       * @param channel
       * @param msisdn this is the mobile number of user to be subscribed
       * @param serviceObject this is the service config to be subscribed against
       */
	subscribeUser(reqBody) {
		const {
 channel, msisdn, service,
} = reqBody
		const response = {}
					return SubscriptionService.sendSubscriptionRequest(msisdn, channel, service, 'API')
						.then((subscriptionData) => {
							TerraLogger.debug(subscriptionData, 'subscription data')
							response.error = false
							response.data = subscriptionData
							return response
						}).catch((error) => {
							TerraLogger.debug(`message: ${error.message}`)
							response.error = true
							response.data = error.response
							response.statusCode = error.statusCode
							response.message = error.message
							return response
				})
	},


	/**
         * Unsubscribe a user from Airtel's SE.
         * It also logs the unsubscription request
         *
         * @param req
         * @param res
         * @methodVerb POST
         */
	unSubscribeRequest(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'channel', 'productId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		const airtelReqBody = {
			msisdn: req.body.msisdn,
			channel: req.body.channel,
			service: {
				product: {
					productId: req.body.productId,
				},
			},
		}

		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for request:${missingFields}`,
			})
		}
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				TerraLogger.debug(`Making a unsubscription request for ${req.body.msisdn}`)
				// If un-subscription was successful, update the status field of the record in
				// subscription collection and return success...
				return this.unSubscribeUser(airtelReqBody)
					.then((response) => {
						TerraLogger.debug(`response ${JSON.stringify(response)}`)
						if (response.error) {
							return ResponseManager.sendErrorResponse({
								res,
								response: response.data,
								message: response.message,
							})
						}
						// push unsubscription data to queue.
						if (response.data) {
							 try {
						  publish(config.rabbit_mq.airtel.un_subscription_queue, { ...response.data.response })
						 	.then(() => {
								TerraLogger.debug('successfully pushed to the Airtel unsubscription data queue')
							return ResponseManager.sendResponse({ res, responseBody: response.data })
						})
					} catch (err) {
						return ResponseManager.sendErrorResponse({
							res,
							message: `Unable to push unsubscription request data to queue, ${err}`,
						})
					}
				}
					}).catch((error) => {
						TerraLogger.debug(error)
						return ResponseManager.sendErrorResponse({ res, message: error.message })
					})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},


	/**
       * This is a method use to unsubcribe user from the queue
       * @param msisdn this is the mobile number of user to be unsubcribed from a service
       * @param service this is the service object - contains the productId
	   * @param channel channel for the request
       */
	unSubscribeUser(reqBody) {
		const { msisdn, service, channel } = reqBody
		const response = {}
		TerraLogger.debug(`Making a unsubscription request for ${msisdn}`)
		return SubscriptionService.sendUnSubscriptionRequest(msisdn, service, channel, 'API')
			.then((unsubscriptionData) => {
				TerraLogger.debug(`message: ${JSON.stringify(unsubscriptionData)}`)
				response.error = false
				response.data = unsubscriptionData
				return response
			})
			.catch((error) => {
				TerraLogger.debug(`Error attempting to unsubscribe user msisdn - ${msisdn}`, error)
				response.error = true
				response.data = error
				response.statusCode = error.statusCode
				response.message = error.message || `Error attempting to unsubscribe user msisdn - ${msisdn}`
				return response
			})
	},


	/**
       * This is a method use to get the status of a user subscription to a service
       * @param msisdn this is the mobile number of user subscribed to a service
       * @param productId this is the productID
    */
	// get status of service subscription
	async getSubscriptionStatus(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const { msisdn, serviceId } = req.query

		const requiredParams = ['msisdn', 'serviceId']
		const missingFields = Utils.authenticateParams(req.query, requiredParams)

		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for query request:  ${missingFields}`,
			})
		}

			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword == config.userAuth.password) {
				try {
					const subscriptionDetails = await SubscriptionService.getSubscriptionDetails(msisdn, serviceId)
					if (subscriptionDetails) {
						return ResponseManager.sendResponse({
							res,
							responseBody: subscriptionDetails.action,
						})
					}
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						message: 'The subscriber does not exist(invalid status)!',
						responseBody: '',
					})
				}
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},


	async AirtelPostBack(req, res) {
		TerraLogger.debug('getting feedback from airtel')
		const data = req.body
		TerraLogger.debug(data)

		const resp = data.args.notificationRespDTO

		//  reformat data to send to Queue
		const dataToSend = {
	        msisdn: resp.msisdn,
			transactionId: resp.xactionId,
			status: 'success',
			meta: {
				amount: parseFloat(resp.amount),
				chargingTime: resp.chargigTime,
				lowBalance: resp.lowBalance,
			},
			network: 'airtel',
			serviceId: resp.productId,
			message: resp.errorMsg,
		}

		//  check for post-back message to route data to queue\

		if (resp.errorCode === 1001 || resp.errorCode === '1001') {
				// process airtel feedback here for un susbcription only - for the aggregator platform
		return publish(config.rabbit_mq.airtel.un_subscription_queue, { ...dataToSend })
		.then(() => {
			TerraLogger.debug('successfully pushed postback data to queue')
			return ResponseManager.sendResponse({
				res,
				message: 'successfully pushed Airtel-Postback data to queue',
			})
		}).catch((err) => ResponseManager.sendErrorResponse({
				res,
				message: `Unable to push postback data to queue, ${err}`,
			}))
		}
		// process airtel feedback here for susbcription only - for the aggregator platform
		return publish(config.rabbit_mq.airtel.subscription_postback_queue, { ...dataToSend })
			.then(() => {
				TerraLogger.debug('successfully pushed postback data to queue')
				return ResponseManager.sendResponse({
					res,
					message: 'successfully pushed Airtel-Postback data to queue',
				})
			}).catch((err) => ResponseManager.sendErrorResponse({
					res,
					message: `Unable to push postback data to queue, ${err}`,
				}))
	},
}

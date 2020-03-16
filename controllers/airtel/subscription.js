/* eslint-disable valid-typeof */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-tabs */
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

		// {
		// 	"msisdn":"09020327785",
		// 	"channel": "sms",
		// 	"service": {
		// 		"shortCode": "38240",
		// 		"name": "Sports 5 Days",
		// 		"cpID": "124",
		// 		"cpName": "2394716_IYKEJORDAN_NG_SE",
		// 		 "cpPassword": "$*K04s6/",
		// 		 "product": {
		// 		  "productId": "8202",
		// 		  "duration": "2",
		// 		  "amount": "20",
		// 		  "isMaster": "false",
		// 		  "productName": "playzone"
		// 		}
		// 	}
		// }

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
				res, message: `Please pass the following parameters for request:${missingFields}`,
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
						console.log(`response ${JSON.stringify(response)}`)
						if (response.error) {
							// eslint-disable-next-line max-len
							return ResponseManager.sendErrorResponse({ res, message: response.message, responseBody: response.data })
						}
						if (response.data) {
							return ResponseManager.sendResponse({ res, responseBody: response.data })
						}
					}).catch((error) => {
						console.log(error)
						return ResponseManager.sendErrorResponse({ res, message: error.message })
					})
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
		const { channel, msisdn, service } = reqBody
		const response = {}
					return SubscriptionService.sendSubscriptionRequest(msisdn, channel, service, 'API')
						.then((subscriptionData) => {
							console.log(subscriptionData, 'subscription data')
							response.error = false
							response.data = subscriptionData
							return response
						}).catch((error) => {
							console.log(`message: ${error.message}`)
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
				console.log(`Making a unsubscription request for ${req.body.msisdn}`)
				// If un-subscription was successful, update the status field of the record in
				// subscription collection and return success...
				return this.unSubscribeUser(airtelReqBody)
					.then((response) => {
						console.info(`response ${response}`)
						if (response.error) {
							return ResponseManager.sendErrorResponse({
								res,
								response: response.data,
								message: response.message,
							})
						}
						// push unsubscription data to queue.
						if (response.data) {
							return ResponseManager.sendResponse({ res, responseBody: response.data })
						}
					}).catch((error) => {
						console.info(error)
						return ResponseManager.sendErrorResponse({ res, message: error.message })
					})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},


	/**
       * This is a method use to unsubcribe user from the queue
       * @param msisdn this is the mobile number of user to be unsubcribed from a service
       * @param serviceObject this is the serviceObject
       */
	unSubscribeUser(reqBody) {
		const { msisdn, service, channel } = reqBody
		const response = {}
		console.info(`Making a unsubscription request for ${msisdn}`)
		// If un-subscription was successful, update the status field of the record in
		// subscription collection and return success...
		return SubscriptionService.sendUnSubscriptionRequest(msisdn, service, channel, 'API')
			.then((unsubscriptionData) => {
				console.info(`message: ${unsubscriptionData}`)
				response.error = false
				response.data = unsubscriptionData
				return response
			})
			.catch((error) => {
				console.error(`Error attempting to unsubscribe user msisdn - ${msisdn}`, error)
				response.error = true
				response.data = error
				response.statusCode = error.statusCode
				response.message = error.message || `Error attempting to unsubscribe user msisdn - ${msisdn}`
				return response
			})
	},


	/**
       * This is a method use to get the statua of a user subscription to a service
       * @param msisdn this is the mobile number of user subscribed to a service
       * @param serviceID this is the serviceID
    */
	// get status of service subscription
	async getSubscriptionStatus(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'serviceId']
		const missingFields = Utils.authenticateParams(req.query, requiredParams)

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
				try {
					const subscriptionDetails = await SubscriptionService.getSubscriptionStatus(req.query)
					if (subscriptionDetails) {
						return ResponseManager.sendResponse({
							res,
							message: 'Subscription status successfully fetched',
							data: subscriptionDetails,
						})
					}
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						message: error,
						data: '',
					})
				}
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},


	async airtelDataSyncPostBack(req, res) {
		console.log('getting data sync feedback from airtel')
		const data = req.body
		console.log(data)
		publish(config.rabbit_mq.airtel.postback_queue, data)
			.then((status) => {
				console.log('successfully pushed postback data to queue')
				ResponseManager.sendResponse({
					res,
					message: 'ok',
					responseBody: status,
				})
			}).catch((err) => {
				ResponseManager.sendErrorResponse({
					res,
					message: 'unable to push postback data to queue',
					responseBody: err,
				})
			})
	},
}

/* eslint-disable indent */
/* eslint-disable prefer-template */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-tabs */

const TerraLogger = require('terra-logger')
const Utils = require('../../lib/utils')
const ResponseManager = require('../../commons/response')
const MTNSDPAPIHandler = require('../../lib/mtn/subscription')
const config = require('../../config')
const publish = require('../../rabbitmq/producer')


module.exports = {
	async subscribe(req, res) {
		const auth = req.headers.authorization

		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'product_id']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		if (missingFields.length != 0) {
			return ResponseManager.sendErrorResponse({
				res, message: 'Please pass the following parameters for request: ' + missingFields,
			})
		}
			const authDetails = auth.split(' ')
			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {

				const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
				const data = {
					spId: config.mtn.spID,
					spPwd: config.mtn.spPwd,
					productid: req.body.product_id,
				}
				try {
					const subscribedResponse = await MTNSDPAPIHandler.subscribe(sanitized_msisdn, data)

					if (subscribedResponse.ResultCode == 1) {
						return ResponseManager.sendErrorResponse({
							res,
							message: 'subscription call failed!',
							responseBody: subscribedResponse,
						})
					}
					try {
						await publish(config.rabbit_mq.mtn.subscription_queue, { ...subscribedResponse.data, network: 'MTN'})
							.then((status) => {
								console.info(`successfully pushed to the MTN subscription data queue: ${status}`)
								return ResponseManager.sendResponse({
									res,
									message: 'Subscription was successful',
									responseBody: subscribedResponse,
								})
							})
					} catch (err) {
						return ResponseManager.sendErrorResponse({
							res,
							message: 'unable to push subscription data to queue',
							responseBody: err,
						})
					}
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						message: 'subscription call failed!',
						responseBody: error,
					})
				}
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},


	async unsubscribe(req, res) {
		const auth = req.headers.authorization
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}

		const requiredParams = ['msisdn', 'product_id']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)

		if (missingFields.length != 0) {
			return ResponseManager.sendErrorResponse({
				res, message: 'Please pass the following parameters for request : ' + missingFields,
			})
		}

			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {

				const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
				const data = {
					spId: config.mtn.spID,
					spPwd: config.mtn.spPwd,
					productid: req.body.product_id,
				}

				try {
					const UnSubscribedResponse = await MTNSDPAPIHandler.unsubscribe(sanitized_msisdn, data)

					if (UnSubscribedResponse.ResultCode == 1) {
						return ResponseManager.sendErrorResponse({
							res,
							message: 'unsubscription call failed!',
						})
					}
					try {
						await publish(config.rabbit_mq.mtn.un_subscription_queue, { ...UnSubscribedResponse.data, network: 'MTN' })
							.then((status) => {
								TerraLogger.debug(`successfully pushed to the MTN unsubscription data queue: ${status}`)
								return ResponseManager.sendResponse({
									res,
									message: 'Subscription was successfully removed',
									responseBody: UnSubscribedResponse,
								})
							})
					} catch (err) {
						return ResponseManager.sendErrorResponse({
							res,
							message: 'unable to push unsubscription request data to queue',
							responseBody: err,
						})
					}
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						message: 'unsubscription call failed!',
						responseBody: error,
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
		const requiredParams = ['msisdn', 'productId']
		const missingFields = Utils.authenticateParams(req.query, requiredParams)

		if (missingFields.length != 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for request:${missingFields}`
			})
		}
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {

				const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(req.query)
				if (subscriptionDetail) {
					return ResponseManager.sendResponse({
						res,
						responseBody: subscriptionDetail.data.response.status,
						message: 'status was succesfully fetched',
					})
				}
					return ResponseManager.sendErrorResponse({
						res,
						message: 'Unable to get subscription status',
					})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},

	async MTNDataSyncPostBack(req, res) {
		TerraLogger.debug('getting data sync feedback from mtn')
		const data = req.body
		TerraLogger.debug(data)
		await publish(config.rabbit_mq.mtn.postback_queue, { ...data.data, network: 'MTN' })
			.then((status) => {
				TerraLogger.debug('successfully pushed postback data to queue')
				return ResponseManager.sendResponse({
					res,
					message: 'ok',
					responseBody: status,
				})
			}).catch((err) => ResponseManager.sendErrorResponse({
					res,
					message: 'unable to push postback data to queue',
					responseBody: err,
				}))
	},

}

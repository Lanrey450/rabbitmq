/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-tabs */

const Utils = require('../../lib/utils')
const ResponseManager = require('../../commons/response')
const MTNSDPAPIHandler = require('../../lib/mtn/subscription')
const config = require('../../config')
const publish = require('../../rabbitmq/producer')

module.exports = {
	async subscribe(req, res) {
		const auth = req.headers.authorization

		if (auth) {
			const authDetails = auth.split(' ')
			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				const { msisdn, product_id } = req.body
				if (!msisdn || !product_id) {
					return ResponseManager.sendErrorResponse({
						res,
						message: 'Please pass msisdn and product_id',
					})
				}
				const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false)
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
						publish(config.rabbit_mq.mtn.subscription_queue, subscribedResponse)
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
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},


	async unsubscribe(req, res) {
		const auth = req.headers.authorization

		if (auth) {
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				const { msisdn, product_id } = req.body
				console.log(req.body)

				if (!msisdn || !product_id) {
					console.log('pass msisdn and product_id')
					return ResponseManager.sendErrorResponse({
						res,
						message: 'pass msisdn and product_id',
					})
				}
				const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false)
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
						publish(config.rabbit_mq.mtn.un_subscription_queue, UnSubscribedResponse)
							.then((status) => {
								console.info(`successfully pushed to the MTN unsubscription data queue: ${status}`)
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
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},

	async status(req, res) {
		const auth = req.headers.authorization

		if (auth) {
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				const { msisdn, serviceId } = req.query
				if (!msisdn || !serviceId) {
					return ResponseManager.sendErrorResponse({
						res,
						message: 'msisdn and serviceId are required in query param',
					})
				}

				MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId).catch((error) => ResponseManager.sendErrorResponse({
					res,
					responseBody: error,
					message: 'Unable to get subscription',
				}))

				const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId)

				if (subscriptionDetail) {
					return ResponseManager.sendResponse({
						res,
						responseBody: subscriptionDetail,
						message: 'status was succesfully fetched',
					})
				}
				return ResponseManager.sendErrorResponse({
					res,
					message: 'Subscription does not exist',
				})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},

	async MTNDataSyncPostBack(req, res) {
		console.log('getting data sync feedback from mtn')
		const data = req.body
		console.log(data)
		publish(config.rabbit_mq.mtn.postback_queue, data)
			.then((status) => {
				console.log('successfully pushed postback data to queue')
				return ResponseManager.sendResponse({
					res,
					message: 'ok',
					responseBody: status,
				})
			}).catch((err) => {
				return ResponseManager.sendErrorResponse({
					res,
					message: 'unable to push postback data to queue',
					responseBody: err,
				})
			})
	},

}

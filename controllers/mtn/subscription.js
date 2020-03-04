/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-tabs */


const bcrypt = require('bcrypt')
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

			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				const {
					service_id, service_password, msisdn, product_id,
				} = req.body
				if (!msisdn || !product_id) {
					console.log('pass msisdn and product_id')
					ResponseManager.sendErrorResponse({
						res,
						message: 'pass msisdn and product_id',
					})
					return
				}
				const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false)
				const data = {
					spId: service_id,
					spPwd: service_password,
					productid: product_id,
				}

				try {
					const subscribedResponse = await MTNSDPAPIHandler.subscribe(sanitized_msisdn, data)

					if (subscribedResponse.ResultCode == 1) {
						ResponseManager.sendErrorResponse({
							res,
							message: 'subscription call failed!',
							responseBody: subscribedResponse,
						})
						return
					}
					try {
						publish(config.rabbit_mq.queue, subscribedResponse)
							.then((status) => {
								console.info(`successfully pushed to the MTN subscription data queue: ${status}`)
								ResponseManager.sendResponse({
									res,
									message: 'Subscription was successful',
									responseBody: subscribedResponse,
								})
							})
					} catch (err) {
						ResponseManager.sendErrorResponse({
							res,
							message: 'unable to push subscription data to queue',
							responseBody: err,
						})
						return
					}
				} catch (error) {
					ResponseManager.sendErrorResponse({
						res,
						message: 'subscription call failed!',
						responseBody: error,
					})
					return
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

			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				const {
					service_id, service_password, msisdn, product_id,
				} = req.body
				console.log(req.body)

				if (!msisdn || !product_id) {
					console.log('pass msisdn and product_id')
					ResponseManager.sendErrorResponse({
						res,
						message: 'pass msisdn and product_id',
					})
					return
				}
				const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false)
				const data = {
					spId: service_id,
					spPwd: service_password,
					productid: req.body.product_id,
				}

				try {
					const UnSubscribedResponse = await MTNSDPAPIHandler.unsubscribe(sanitized_msisdn, data)

					if (UnSubscribedResponse.ResultCode == 1) {
						ResponseManager.sendErrorResponse({
							res,
							message: 'unsubscription call failed!',
						})
						return
					}
					try {
						publish(config.rabbit_mq.queue, UnSubscribedResponse)
							.then((status) => {
								console.info(`successfully pushed to the MTN subscription data queue: ${status}`)
								ResponseManager.sendResponse({
									res,
									message: 'Subscription was successfully removed',
									responseBody: UnSubscribedResponse,
								})
							})
					} catch (err) {
						ResponseManager.sendErrorResponse({
							res,
							message: 'unable to push unsubscription request data to queue',
							responseBody: err,
						})
						return
					}
				} catch (error) {
					ResponseManager.sendErrorResponse({
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

			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				const { msisdn, serviceId } = req.query
				if (!msisdn || !serviceId) {
					ResponseManager.sendErrorResponse({
						res,
						message: 'msisdn and serviceId are required in query param',
					})
					return
				}

				MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId).catch((error) => {
					ResponseManager.sendErrorResponse({
						res,
						responseBody: error,
						message: 'Unable to get subscription',
					})
				})

				const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId)

				if (subscriptionDetail) {
					ResponseManager.sendResponse({
						res,
						responseBody: subscriptionDetail,
						message: 'status was succesfully fetched',
					})
					return
				}
				ResponseManager.sendErrorResponse({
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
	},

}

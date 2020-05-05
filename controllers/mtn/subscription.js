/* eslint-disable no-fallthrough */
/* eslint-disable no-duplicate-case */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-empty */
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
				res, message: `Please pass the following parameters for post request: ${missingFields}`,
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

						const errCode = subscribedResponse.ResultDesc
						switch (errCode) {
							case '22007203': {
								return ResponseManager.sendErrorResponse({
								res,
								message: `${subscribedResponse.ResultDetails}`,
						})
						}
						case '22007201': {
							return ResponseManager.sendErrorResponse({
							res,
							message: `${subscribedResponse.ResultDetails}`,
					})
					} case (errCode >= '10000000' && errCode <= '10009999'): {
						return ResponseManager.sendErrorResponse({
						res,
						message: `${subscribedResponse.ResultDetails}`,
				})
				}
				case '22007203': {
					return ResponseManager.sendErrorResponse({
					res,
					message: `${subscribedResponse.ResultDetails}`,
			})
			}
			case '22007014': {
				return ResponseManager.sendErrorResponse({
				res,
				message: `${subscribedResponse.ResultDetails}`,
		})
		} case '22007238': {
			return ResponseManager.sendErrorResponse({
			res,
			message: `${subscribedResponse.ResultDetails}`,
	})
	} case '22007306': {
		return ResponseManager.sendErrorResponse({
		res,
		message: `${subscribedResponse.ResultDetails}`,
})
} case '22007206': {
	return ResponseManager.sendErrorResponse({
	res,
	message: `${subscribedResponse.ResultDetails}`,
})
} case '22007011': {
		return ResponseManager.sendErrorResponse({
		res,
		message: `${subscribedResponse.ResultDetails}`,
		})
		 } case '00000000': {
			 try {
				await publish(config.rabbit_mq.mtn.subscription_queue, { ...subscribedResponse })
				.then(() => {
					TerraLogger.debug('successfully pushed to the MTN subscription data queue')
					 return ResponseManager.sendResponse({
						res,
						responseBody: subscribedResponse,
						})
					})
			 } catch (error) {
				return ResponseManager.sendErrorResponse({
					res,
					message: `Unable to push subscription data to queue, :: ${error}`,
					})
				}
			 }
		   default: {
			return ResponseManager.sendErrorResponse({
				res,
				message: `${subscribedResponse.ResultDetails}`,
				})
				}
			}
			} catch (error) {
				return ResponseManager.sendErrorResponse({
				  res,
				  message: 'Subscription request failed',
				  responseBody: error,
				})
			}
	} else {
	 return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	}
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
				res, message: `Please pass the following parameters for post request: ${missingFields}`,
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

					try {
						await publish(config.rabbit_mq.mtn.un_subscription_queue, { ...UnSubscribedResponse })
							.then(() => {
								TerraLogger.debug('successfully pushed to the MTN unsubscription data queue')
								return ResponseManager.sendResponse({
									res,
									responseBody: UnSubscribedResponse,
								})
							})
					} catch (err) {
						return ResponseManager.sendErrorResponse({
							res,
							message: `Unable to push unsubscription request data to queue, ${err}`,
						})
					}
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						message: 'Unsubscription request failed',
						responseBody: error,
					})
				}
			} else {
				return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
			}
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
				res, message: `Please pass the following parameters for query request:  ${missingFields}`,
			})
		}
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				try {
					const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(req.query)
				if (subscriptionDetail) {
					return ResponseManager.sendResponse({
						res,
						responseBody: subscriptionDetail.data.response.status,
					})
				}
				} catch (error) {
					return ResponseManager.sendErrorResponse({
						res,
						message: `Unable to get subscription status for user with error,  ${error}`,
					})
			}
				}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},

	async MTNDataSyncPostBack(req, res) {
		TerraLogger.debug('getting data sync feedback from mtn')
		const data = req.body
		TerraLogger.debug(data)
		// process mtn feedback here

		await publish(config.rabbit_mq.mtn.postback_queue, { ...data })
			.then(() => {
				TerraLogger.debug('successfully pushed postback data to queue')
				return ResponseManager.sendResponse({
					res,
					message: 'successfully pushed MTN-Postback data to queue',
				})
			}).catch((err) => ResponseManager.sendErrorResponse({
					res,
					message: `Unable to push postback data to queue, ${err}`,
				}))
	},

}

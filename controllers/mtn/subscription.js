/* eslint-disable default-case */
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

					// reformat data to push to MTN queue
					const dataToPush = {
						msisdn: sanitized_msisdn,
						status: 'success',
						meta: {
							ResultCode: subscribedResponse.ResultCode,
							ResultDesc: subscribedResponse.ResultDesc,
						},
						action: config.request_type.sub,
						network: 'mtn',
						serviceId: data.productid,
						message: subscribedResponse.ResultDetails,
					}

					const MTNStatusCode = subscribedResponse.ResultDesc

					switch (MTNStatusCode) {
					case '22007233': {
						const { msisdn } = req.body
						const serviceId = data.productid
						// we do not push duplicate records to the queue
						return MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId)
						.then((subRecord) => {
							console.log(subRecord, '-------sub record')
							if (subRecord === null) {
							return publish(config.rabbit_mq.mtn.subscription_queue, { ...dataToPush })
								.then(() => {
									TerraLogger.debug('successfully pushed to the Airtel subscription data queue')
									return ResponseManager.sendResponse({
										res,
										responseBody: dataToPush,
									})
								})
							}
							return ResponseManager.sendResponse({
								res,
								responseBody: dataToPush,
							})
						}).catch(() => { TerraLogger.debug() })
						}
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
					} case (MTNStatusCode >= '10000000' && MTNStatusCode <= '10009999'): {
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
				  message: `Subscription request failed ${error}`,
			  })
		 }
	} else {
	 return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	}
},

async sendSms(req, res) {
	const auth = req.headers.authorization

	if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	}

	const requiredParams = ['msisdn', 'message', 'service_id', 'shortcode', 'notify_url']
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
				service_id: req.body.service_id,
				msisdn: sanitized_msisdn,
				shortcode: req.body.shortcode,
				notify_url: req.body.notify_url,
				message: req.body.message
			}
			try {
				const subscribedResponse = await MTNSDPAPIHandler.sendSmsMT(data)

				return ResponseManager.sendErrorResponse({
					res,
					message: `Still working on it - ${subscribedResponse}`,
				})

				// // reformat data to push to MTN queue
				// const dataToPush = {
				// 	msisdn: sanitized_msisdn,
				// 	status: 'success',
				// 	meta: {
				// 		ResultCode: subscribedResponse.ResultCode,
				// 		ResultDesc: subscribedResponse.ResultDesc,
				// 	},
				// 	action: config.request_type.sub,
				// 	network: 'mtn',
				// 	serviceId: data.productid,
				// 	message: subscribedResponse.ResultDetails,
				// }

// 				const MTNStatusCode = subscribedResponse.ResultDesc

// 				switch (MTNStatusCode) {
// 				case '22007233': {
// 					const { msisdn } = req.body
// 					const serviceId = data.productid
// 					// we do not push duplicate records to the queue
// 					return MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId)
// 					.then((subRecord) => {
// 						console.log(subRecord, '-------sub record')
// 						if (subRecord === null) {
// 						return publish(config.rabbit_mq.mtn.subscription_queue, { ...dataToPush })
// 							.then(() => {
// 								TerraLogger.debug('successfully pushed to the Airtel subscription data queue')
// 								return ResponseManager.sendResponse({
// 									res,
// 									responseBody: dataToPush,
// 								})
// 							})
// 						}
// 						return ResponseManager.sendResponse({
// 							res,
// 							responseBody: dataToPush,
// 						})
// 					}).catch(() => { TerraLogger.debug() })
// 					}
// 						case '22007203': {
// 							return ResponseManager.sendErrorResponse({
// 							res,
// 							message: `${subscribedResponse.ResultDetails}`,
// 					})
// 					}
// 					case '22007201': {
// 						return ResponseManager.sendErrorResponse({
// 						res,
// 						message: `${subscribedResponse.ResultDetails}`,
// 				})
// 				} case (MTNStatusCode >= '10000000' && MTNStatusCode <= '10009999'): {
// 					return ResponseManager.sendErrorResponse({
// 					res,
// 					message: `${subscribedResponse.ResultDetails}`,
// 			})
// 			}
// 			case '22007203': {
// 				return ResponseManager.sendErrorResponse({
// 				res,
// 				message: `${subscribedResponse.ResultDetails}`,
// 		})
// 		}
// 		case '22007014': {
// 			return ResponseManager.sendErrorResponse({
// 			res,
// 			message: `${subscribedResponse.ResultDetails}`,
// 	})
// 		} case '22007238': {
// 		return ResponseManager.sendErrorResponse({
// 		res,
// 		message: `${subscribedResponse.ResultDetails}`,
// })
// 	} case '22007306': {
// 	return ResponseManager.sendErrorResponse({
// 	res,
// 	message: `${subscribedResponse.ResultDetails}`,
// })
// } case '22007206': {
// return ResponseManager.sendErrorResponse({
// res,
// message: `${subscribedResponse.ResultDetails}`,
// })
// } case '22007011': {
// 	return ResponseManager.sendErrorResponse({
// 	res,
// 	message: `${subscribedResponse.ResultDetails}`,
// 	})
// 	 }
// 		default: {
// 				return ResponseManager.sendErrorResponse({
// 				res,
// 				message: `${subscribedResponse.ResultDetails}`,
// 					})
// 				}
// 			}
		} catch (error) {
			// enter here when promise is rejected and not resolved (const subscribedResponse = await MTNSDPAPIHandler.sendSmsMT(data))
			return ResponseManager.sendErrorResponse({
			  res,
			  message: `SendSMS request failed ${error}`,
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

					const dataToPush = {
						msisdn: sanitized_msisdn,
						status: 'success',
						meta: {
							ResultCode: UnSubscribedResponse.ResultCode,
							ResultDesc: UnSubscribedResponse.ResultDesc,
						},
						action: config.request_type.unsub,
						network: 'mtn',
						serviceId: data.productid,
						message: UnSubscribedResponse.ResultDetails,
					}


					// try {
						// await publish(config.rabbit_mq.mtn.un_subscription_queue, { ...dataToPush })
						// 	.then(() => {
						// 		TerraLogger.debug('successfully pushed to the MTN unsubscription data queue')
								return ResponseManager.sendResponse({
									res,
									responseBody: dataToPush,
								})
							// })
					// } catch (err) {
					// 	return ResponseManager.sendErrorResponse({
					// 		res,
					// 		message: `Unable to push unsubscription request data to queue, ${err}`,
					// 	})
					// }
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

		const { msisdn, serviceId } = req.query


		const requiredParams = ['msisdn', 'serviceId']
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

			if (username == config.userAuth.username && rawPassword == config.userAuth.password) {
				try {
					const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId)
				if (subscriptionDetail) {
					return ResponseManager.sendResponse({
						res,
						responseBody: subscriptionDetail.action,
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
		const resp = data.soapenvBody.ns1syncOrderRelation

		const extraInfo = resp.ns1extensionInfo.item

		const selectedFields = ['cycleEndTime', 'serviceAvailability', 'Starttime', 'keyword', 'fee', 'transactionID'];
		const result = {}

		// loop through array and get the selected fields
		extraInfo.forEach((elem) => {
			if (selectedFields.includes(elem.key)) {
				result[elem.key] = elem
			}
		})

		// reformat mtn data to be sent to queue
		const { cycleEndTime, serviceAvailability, Starttime, keyword, fee, transactionID } = result

		const dataToSend = {
			msisdn: resp.ns1userID.ID,
			status: 'success',
			meta: {
				updateTime: resp.ns1updateTime || '',
				effectiveTime: resp.ns1effectiveTime || '',
				expiryTime: resp.ns1expiryTime || '',
				serviceAvailability: (serviceAvailability) ? serviceAvailability.value : '',
				fee: (fee) ? fee.value : '',
				keyword: (keyword) ? keyword.value : '',
				cycleEndTime: (cycleEndTime) ? cycleEndTime.value : '',
				Starttime: (Starttime) ? Starttime.value : '',
			},
			network: 'mtn',
			serviceId: resp.ns1productID,
			message: resp.ns1updateDesc,
			transactionId: (transactionID) ? transactionID.value : '',
		}


		if (dataToSend.message === 'Addition') {
			return publish(config.rabbit_mq.mtn.subscription_postback_queue, { ...dataToSend })
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
		}
		return publish(config.rabbit_mq.mtn.un_subscription_queue, { ...dataToSend })
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

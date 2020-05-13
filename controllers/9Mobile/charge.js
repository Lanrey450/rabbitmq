/* eslint-disable max-len */
/* eslint-disable no-tabs */

const TerraLogger = require('terra-logger')
const ResponseManager = require('../../commons/response')
const NineMobileChargeApi = require('../../lib/9Mobile/charging')
const Utils = require('../../lib/utils')
const config = require('../../config')
// const publish = require('../../rabbitmq/producer')

module.exports = {
	async chargeSync(req, res) {
		const auth = req.headers.authorization
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}
		const requiredParams = ['msisdn', 'serviceId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)
		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for post request: ${missingFields}`,
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
				const nineMobileRequestBody = {
					userIdentifier: req.body.msisdn,
					serviceId: req.body.serviceId,
					context: 'STATELESS',
				}
				const data = await NineMobileChargeApi.sync(nineMobileRequestBody)

				// format data to push to queue
				const dataToPush = {
					status: 'success',
					network: '9mobile',
					transactionId: data.responseData.transactionUUID,
					serviceId: nineMobileRequestBody.serviceId,
					msisdn: nineMobileRequestBody.userIdentifier,
					message: data.message,
					meta: {
						result: data.responseData.result,
						requestId: data.requestId,
						code: data.code,
						inError: data.inError,
					},
				}

				// await publish(config.rabbit_mq.nineMobile.charge_queue, { ...dataToPush })
				// 	.then(() => {
				// 		TerraLogger.debug('successfully pushed charging data to queue')
				return ResponseManager.sendResponse({
					res,
					responseBody: dataToPush,
				})
				// }).catch((err) => ResponseManager.sendErrorResponse({
				// 	res,
				// 	message: err.message,
				// }))
			} catch (error) {
				TerraLogger.debug(error)
				return ResponseManager.sendErrorResponse({ res, message: `Unable to reach the 9mobile server - ${error}` })
			}
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},


	async chargeAsync(req, res) {
		const auth = req.headers.authorization
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
		}
		const requiredParams = ['msisdn', 'serviceId']
		const missingFields = Utils.authenticateParams(req.body, requiredParams)
		if (missingFields.length !== 0) {
			return ResponseManager.sendErrorResponse({
				res, message: `Please pass the following parameters for post request:   ${missingFields}`,
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
				const nineMobileRequestBody = {
					userIdentifier: req.body.msisdn,
					serviceId: req.body.serviceId,
					context: 'RENEW',
				}
				const data = await NineMobileChargeApi.async(nineMobileRequestBody)

				//  format data to push to queue
				const dataToPush = {
					status: 'success',
					network: '9mobile',
					transactionId: data.responseData.transactionUUID,
					serviceId: nineMobileRequestBody.serviceId,
					msisdn: nineMobileRequestBody.userIdentifier,
					message: data.message,
					meta: {
						result: data.responseData.result,
						requestId: data.requestId,
						code: data.code,
						inError: data.inError,
					},
				}

				// return publish(config.rabbit_mq.nineMobile.charge_queue, { ...dataToPush })
				// .then(() => {
				// TerraLogger.debug('successfully pushed charging data to queue')
				return ResponseManager.sendResponse({
					res,
					responseBody: dataToPush,
				})
				// })
				// .catch((err) => ResponseManager.sendErrorResponse({
				// 	res,
				// 	message: err.message,
				// }))
			} catch (error) {
				TerraLogger.debug(error)
				return ResponseManager.sendErrorResponse({ res, message: `Unable to reach 9mobile server - ${error}` })
			}
		}
		return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
	},
}

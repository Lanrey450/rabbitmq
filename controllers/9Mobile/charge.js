/* eslint-disable max-len */
/* eslint-disable no-tabs */
const ResponseManager = require('../../commons/response')
const NineMobileChargeApi = require('../../lib/9Mobile/charging')
const config = require('../../config')
const publish = require('../../rabbitmq/producer')

module.exports = {
	async chargeSync(req, res) {
		const auth = req.headers.authorization

		if (auth) {
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			// eslint-disable-next-line max-len
			// eslint-disable-next-line eqeqeq
			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				const data = await NineMobileChargeApi.sync(req.body)
				ResponseManager.sendResponse({
					res,
					responseBody: data,
				})
				return publish(config.rabbit_mq.nineMobile.subscription_queue, data)
					.then((status) => {
						console.log('successfully pushed charging data to queue')
						return ResponseManager.sendResponse({
							res,
							message: 'ok',
							responseBody: status,
						})
					}).catch((err) => {
						return ResponseManager.sendErrorResponse({
							res,
							message: 'unable to push charging data to queue',
							responseBody: err,
						})
					})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},

	async chargeAsync(req, res) {
		const auth = req.headers.authorization

		if (auth) {
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]

			// eslint-disable-next-line max-len
			// eslint-disable-next-line eqeqeq
			if (username == config.userAuth.username && rawPassword === config.userAuth.password) {
				const data = await NineMobileChargeApi.async(req.body)
				ResponseManager.sendResponse({
					res,
					responseBody: data,
				})
				return publish(config.rabbit_mq.nineMobile.subscription_queue, data)
					.then((status) => {
						console.log('successfully pushed charging data to queue')
						return ResponseManager.sendResponse({
							res,
							message: 'ok',
							responseBody: status,
						})
					}).catch((err) => {
						return ResponseManager.sendErrorResponse({
							res,
							message: 'unable to push charging data to queue',
							responseBody: {
								error: true,
								message: err.message,
							},
						})
					})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},
}

/* eslint-disable max-len */
/* eslint-disable no-tabs */
const bcrypt = require('bcrypt')
const ResponseManager = require('../../commons/response')
const NineMobileChargeApi = require('../../lib/9Mobile/charging')
const config = require('../../config')

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
			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				ResponseManager.sendResponse({
					res,
					responseBody: await NineMobileChargeApi.sync(req.body),
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
			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				ResponseManager.sendResponse({
					res,
					responseBody: await NineMobileChargeApi.async(req.body),
				})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},
}

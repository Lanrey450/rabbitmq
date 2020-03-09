/* eslint-disable consistent-return */
/* eslint-disable indent */
/* eslint-disable space-before-blocks */
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable no-tabs */
const bcrypt = require('bcrypt')
// const redis = require('../../redis')
const ResponseManager = require('../../commons/response')
const NineMobileApi = require('../../lib/9Mobile/subscription')

const Utils = require('../../lib/utils')

const config = require('../../config')

// const userConsent = require('./userConsentLayer')


module.exports = {
	async subscribe(req, res) {
		const auth = req.headers.authorization

		if (auth) {
			const authDetails = auth.split(' ')

			const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

			const credentials = rawAuth.split(':')
			const username = credentials[0]
			const rawPassword = credentials[1]


			const { msisdn, channel, serviceID, keyword, feedbackUrl, shortCode } = req.body

			if (username === config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {

			if (!msisdn || !channel || !serviceID || !keyword || !feedbackUrl || !shortCode){
				return ResponseManager.sendErrorResponse({
					res, message: 'Please pass all required parameters for request',
				})
			}
				return Utils.sendUserConsentSMS(msisdn, keyword, channel)
		}
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

			// eslint-disable-next-line max-len
			// eslint-disable-next-line eqeqeq
			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				ResponseManager.sendResponse({
					res,
					responseBody: await NineMobileApi.unsubscribe(req.body),
				})
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

			// eslint-disable-next-line max-len
			// eslint-disable-next-line eqeqeq
			if (username == config.userAuth.username && bcrypt.compareSync(rawPassword, config.userAuth.password)) {
				ResponseManager.sendResponse({
					res,
					responseBody: await NineMobileApi.status(req.body),
				})
			}
			return ResponseManager.sendErrorResponse({ res, message: 'Forbidden, bad authentication provided!' })
		}
		return ResponseManager.sendErrorResponse({ res, message: 'No Authentication header provided!' })
	},
}

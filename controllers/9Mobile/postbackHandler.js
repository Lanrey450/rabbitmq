/* eslint-disable no-tabs */

module.exports = {
	async moRequest(req, res) {
		console.log('mo request')
		console.log(req.body)
		res.send('ok')
	},

	async mtRequest(req, res) {
		console.log('mt request')
		console.log(req.body)
		res.send('ok')
	},

	async optinRequest(req, res) {
		console.log('optin request')
		console.log(req.body)
		res.send('ok')
	},

	async optoutRequest(req, res) {
		console.log('optout request')
		console.log(req.body)
		res.send('ok')
	},

	async userRenewedRequest(req, res) {
		console.log('user-renewed request')
		console.log(req.body)
		res.send('ok')
	},

	async chargeDOBRequest(req, res) {
		console.log('charge-dob request')
		console.log(req.body)
		res.send('ok')
	},

	async chargeAsyncRequest(req, res) {
		console.log('charge async request')
		console.log(req.body)
		res.send('ok')
	},

	async consentmoRequest(req, res) {
		console.log('consent request')
		console.log(req.body)
		res.send('ok')
	},
}

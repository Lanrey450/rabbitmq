/* eslint-disable no-tabs */
const subscriptionHandler = require('./index')

module.exports = {
	subscribe(body) {
		console.log(body, 'req.body to 9Mobile')
		return subscriptionHandler.postRequest('/subscription/optin', body)
	},

	unsubscribe(body) {
		return subscriptionHandler.postRequest('/subscription/optout', body)
	},

	status(body) {
		return subscriptionHandler.postRequest('/subscription/status', body)
	},
}

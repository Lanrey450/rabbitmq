/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const mtn_sdp = require('mtn-sdp-nodejs')
const Subscription = require('../../models/mtn/subscription')

module.exports = {
	async subscribe(msisdn, data) {
		return new Promise((resolve, reject) => {
			mtn_sdp.subscribe(msisdn, data, false, async (err, resp) => {
				if (err) {
					console.log(err, 'Error from MTN subscription engine!')
					reject(err)
				}
				if (resp) {
					console.log('response from MTN subscription engine', resp)
					resolve(resp)
				}
			})
		})
	},

	async unsubscribe(msisdn, data) {
		return new Promise((resolve, reject) => {
			mtn_sdp.unsubscribe(msisdn, data, false, async (err, resp) => {
				if (err) {
					console.log(err, 'Error from MTN unsubscription engine!')
					reject(err)
				}
				if (resp) {
					console.log('response from MTN unsubscription engine', resp)
					resolve(resp)
				}
			})
		})
	},

	async getSubscriptionStatus(msisdn, serviceId) {
		const params = {}
		params.conditions = { msisdn, serviceId }

		return new Promise((resolve, reject) => {
			try {
				const status = Subscription.findOne(params)
				if (status) {
					resolve(status)
				}
			} catch (error) {
				reject(error)
			}
		})
	},
}

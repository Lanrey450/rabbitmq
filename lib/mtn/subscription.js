/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const mtn_sdp = require('mtn-sdp-nodejs')
const Subscription = require('../../models/mtn/subscription')

module.exports = {
	async subscribe(msisdn, data) {
		mtn_sdp.subscribe(msisdn, data, false, async (err, resp) => {
			if (err) {
				console.log(err, 'Error from MTN subscription engine!')
				return err
			}
			if (resp) {
				console.log('response from MTN subscription engine', resp)
				return resp
			}
		})
	},

	async unsubscribe(msisdn, data) {
		mtn_sdp.unsubscribe(msisdn, data, false, async (err, resp) => {
			if (err) {
				console.log(err, 'Error from MTN unsubscription engine!')
				return err
			}
			if (resp) {
				console.log('response from MTN unsubscription engine', resp)
				resp
			}
		})
	},

	async getSubscriptionStatus(msisdn, serviceId) {
		const params = {}
		params.conditions = { msisdn, serviceId }

		try {
			const status = await Subscription.findOne(params)
			if (status) {
				return status
			}
		} catch (error) {
			return error
		}
	},
}

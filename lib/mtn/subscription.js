/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const mtn_sdp = require('mtn-sdp-nodejs')
const TerraLogger = require('terra-logger')
const Subscription = require('../../models/mtn/subscription')


module.exports = {
	async subscribe(msisdn, data) {
		return new Promise((resolve, reject) => {
			const param = { spid: data.spId, service_password: data.spPwd, productid: data.productid }
			mtn_sdp.subscribe(msisdn, param, false, async (err, resp) => {
				if (err) {
					TerraLogger.debug(err, 'Error from MTN subscription engine!')
					reject(err)
				}
				if (resp) {
					TerraLogger.debug('response from MTN subscription engine', resp)
					resolve(resp)
				}
			})
		})
	},

	async unsubscribe(msisdn, data) {
		return new Promise((resolve, reject) => {
			const param = { spid: data.spId, service_password: data.spPwd, productid: data.productid }
			mtn_sdp.unsubscribe(msisdn, param, false, async (err, resp) => {
				if (err) {
					TerraLogger.debug(err, 'Error from MTN unsubscription engine!')
					reject(err)
				}
				if (resp) {
					TerraLogger.debug('response from MTN unsubscription engine', resp)
					resolve(resp)
				}
			})
		})
	},

	//  get subscription with a combination of msisdn and productId for the user
	async getSubscriptionStatus(msisdn, productId) {
		const promise = new Promise((resolve, reject) => {
			const params = {}
			params.conditions = { msisdn, productId }
			try {
				const status = Subscription.findOne(params)
				if (status) {
					resolve(status)
				}
			} catch (error) {
				reject(error)
			}
		})
		return promise
	},
}

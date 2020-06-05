/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const mtn_sdp = require('mtn-sdp-nodejs')
const TerraLogger = require('terra-logger')
const Utils = require('../utils')

const mongoDBClientHelper = require('../../models/mtn/subscription')


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

	async sendSmsMT(data) {
		// data = msisdn,shortcode,notify_url,spPwd, spId, message,service_id
		return new Promise((resolve, reject) => {
			const param = { shortcode: data.shortcode, message: data.message, msisdn: data.msisdn, service_id: data.serviceid, notify_url: data.notify_url}
			const spInfo = { spid: data.spId, service_password: data.spPwd}

			mtn_sdp.sendSms(param, spInfo, async (err, resp) => {
				if (err) {
					TerraLogger.debug(err, 'Error from MTN engine!')
					reject(err)
				}
				if (resp) {
					TerraLogger.debug('response from MTN engine', resp)
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
	async getSubscriptionStatus(msisdn, serviceId) {
		return new Promise((resolve, reject) => {
			const sanitizedMsisdn = Utils.msisdnSanitizer(msisdn)
			const params = {}
			params.msisdn = sanitizedMsisdn
			params.serviceId = serviceId
			return mongoDBClientHelper.findOne(params)
				.then((response) => resolve(response))
				.catch((error) => reject(error))
		})
	},
}

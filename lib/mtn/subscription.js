/* eslint-disable max-len */
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

	async sendSmsMT(data) {
		return new Promise((resolve, reject) => {
			const param = {
				shortcode: data.shortcode, message: data.message, msisdn: data.msisdn, service_id: data.serviceId, notify_url: data.notifyUrl,
			}
			const spInfo = { spid: data.spId, service_password: data.spPwd }


			console.log(param, spInfo)

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


	stopUssdMo(data) {
		return new Promise((resolve, reject) => {
			const param = {
				spid: data.spId, service_id: data.serviceId, service_password: data.spPwd, correlator: data.correlatorId,
			}
			mtn_sdp.stopUssdNotification(param, async (err, resp) => {
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

	startUssdMo(data) {
		return new Promise((resolve, reject) => {
			const param = {
				spid: data.spId, notify_url: data.notifyUrl, service_id: data.serviceId, service_number: data.serviceNumber, service_password: data.spPwd, correlator: data.correlatorId,
			}
			mtn_sdp.startUssdNotification(param, async (err, resp) => {
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

	// startSmsMo(data) {
	// 	return new Promise((resolve, reject) => {
	// 		const param = {
	// 			notify_url: data.notifyUrl, service: data.serviceId, correlator: data.correlatorId, criteria: data.criteria, shortcode: data.shortcode
	// 		}
	// 		const spInfo = { spId: data.spId, spPwd: data.spPwd }

	// 		console.log(spInfo, param)

	// 		mtn_sdp.startSmsNotification(param, spInfo, (err, resp) => {
	// 			if (err) {
	// 			console.log('HERERRERERR')

	// 				TerraLogger.debug(err, 'Error from MTN engine!')
	// 				reject(err)
	// 			}
	// 			if (resp) {
	// 				TerraLogger.debug('response from MTN engine', resp)
	// 				resolve(resp)
	// 			}
	// 		})
	// 	})
	// },

	async startSmsMo(data) {
		
			const param = {
				notify_url: data.notifyUrl, service: data.serviceId, correlator: data.correlatorId, criteria: data.criteria, shortcode: data.shortcode
			}
			const spInfo = { spId: data.spId, spPwd: data.spPwd }

			console.log(spInfo, param)

			return mtn_sdp.startSmsNotification(param, spInfo);
	},

	stopSmsMo(data) {
		return new Promise((resolve, reject) => {
			const param = {
			 service: data.serviceId, correlator: data.correlatorId,
			}
			const spInfo = { spId: data.spId, spPwd: data.spPwd }

			mtn_sdp.stopSmsNotification(param, spInfo, async (err, resp) => {
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

	sendUssd(data) {
		return new Promise((resolve, reject) => {
			const param = {
				spId: data.spId, spPassword: data.spPwd, shortcode: data.shortcode, ussd_string: data.ussd_string, msisdn: data.msisdn, service_id: data.serviceId, option_type: data.option_type,
			}
			mtn_sdp.sendSms(param, async (err, resp) => {
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

}

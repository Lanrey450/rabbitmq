/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const mtn_sdp = require('mtn-sdp-nodejs')
const TerraLogger = require('terra-logger')
const axios = require('axios').default

const Utils = require('../utils')
const MTNMADAPIAPIHandler = require('../../lib/mtn/madapi');
const mongoDBClientHelper = require('../../models/mtn/subscription');
const config = require('../../config')
const redis = require('../../redis')
const ResponseManager = require('../../commons/response')
const { smsOutbound } = require('../../controllers/mtn/madapi')
const { sendSmsMT, generateToken } = require('./madapi')


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

	// async sendSmsMT(data) {
	// 	return new Promise((resolve, reject) => {
	// 		const param = {
	// 			shortcode: data.shortcode, message: data.message, msisdn: data.msisdn, service_id: '23401220000029858', notify_url: data.notifyUrl,
	// 		}
	// 		const spInfo = { spid: data.spId, service_password: data.spPwd }

	// 		// data.externalId

	// 		console.log(param, spInfo)

	// 		mtn_sdp.sendSms(param, spInfo, async (err, resp) => {
	// 			if (err) {
	// 				console.log('err form MTN', err)
	// 				TerraLogger.debug(err, 'Error from MTN engine!')
	// 				reject(err)
	// 			}
	// 			if (resp) {
	// 				console.log('response form MTN', resp)
	// 				TerraLogger.debug('response from MTN engine', resp)
	// 				resolve(resp)
	// 			}
	// 		})
	// 	})
	// },

	async sendSmsMT(data) {
		try {
			const smsPayload = {
				"clientCorrelator": generateId(),
				"message": data.message,
				"receiverAddress": [data.msisdn],
				"senderAddress": data.shortcode,
			}

			console.log('smsPayload', smsPayload);

			const token = await MTNMADAPIAPIHandler.generateToken();
			return sendSmsMT(smsPayload, token);
		
		} catch (e){
			console.log('Error sending message', e);

			return {};
		}
			
	},


	stopUssdMo(data) {
		const param = {
			spid: data.spId, service_id: data.serviceId, service_password: data.spPwd, correlator: data.correlatorId,
		}
		return mtn_sdp.stopUssdNotification(param)
	},

	startUssdMo(data) {
		const param = {
			spid: data.spId, notify_url: data.notifyUrl, service_id: data.serviceId, service_number: data.serviceNumber, service_password: data.spPwd, correlator: data.correlatorId,
		}
		return mtn_sdp.startUssdNotification(param)
	},

	async startSmsMo(data) {
		const param = {
			notify_url: data.notifyUrl, service: data.serviceId, correlator: data.correlatorId, criteria: data.criteria, shortcode: data.shortcode,
		}
		console.log(param, 'param for mtn sdp')
		const spInfo = { spId: data.spId, spPwd: data.spPwd }

		console.log(spInfo, param)

		return mtn_sdp.startSmsNotification(param, spInfo)
	},

	stopSmsMo(data) {
		const param = {
			 service: data.serviceId, correlator: data.correlatorId,
		}
		const spInfo = { spId: data.spId, spPwd: data.spPwd }

		return mtn_sdp.stopSmsNotification(param, spInfo)
	},

	sendUssd(data) {
		const param = {
			spid: data.spId, service_password: data.spPwd, shortcode: data.shortcode, ussd_string: data.ussd_string, msisdn: data.msisdn, service_id: data.serviceId, option_type: data.option_type, linkid: data.linkid, receiveCB: data.receiveCB, senderCB: data.senderCB, msgType: data.msgType,
		}

		return mtn_sdp.sendUssd(param)
	},

 	authorizePayment(data) {
		const param = {
			spid: data.spId,
			service_password: data.spPwd,
			msisdn: data.msisdn,
			service_id: data.serviceId,
			notificationURL: data.notificationURL,
			amount: data.amount,
			transactionId: data.transactionId,
			productName: data.productName,
		}

		return mtn_sdp.authorizePayment(param, true)
	},

	chargeToken(data) {
		const param = {
			spid: data.spId,
			service_password: data.spPwd,
			msisdn: data.msisdn,
			service_id: data.serviceId,
			oauth_token: data.oauth_token,
			referenceCode: data.referenceCode,
			amount: data.amount,
		}
		return mtn_sdp.chargeToken(param, true)
	},

	
	
}

function generateId() {
	return new Date().valueOf();
}

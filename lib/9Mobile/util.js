/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable prefer-const */
/* eslint-disable space-before-function-paren */
/* eslint-disable space-before-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger')

const axios = require('axios')
const config = require('../../config')


// notification endpoint for sms messages
const notificationUrl = config.notification_service_url

module.exports = {

	/**
     * Used to normalize the passed in MSISDN
     *
     * @param {String} phoneNumber MSISDN
     * @param {Boolean} plus Boolean deciding whether to include + as the MSISDN prefix
     * @returns {String} msisdn
     */


	sendUserConsentSMS (params){
        const { msisdn, shortCode, name, amount, validity } = params;
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `You are about to subscribe to ${name}. Service costs N${amount} / ${validity} days. Text 1 to ${shortCode} for Auto renewal or 2 for one-off purchase to continue`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},
	
	sendUserSuccessMessageForUSSDSub (params){
        const { msisdn, shortCode, name, amount, validity } = params;
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, your subscription for the ${name} service was successful. Service costs N${amount}/${validity} days. To unsubscribe, text HELP to ${shortCode}.`,
		}

		return this.sendSMS(payload)
    },
    
    sendUserAutoRenewalSMS (data){
		const param = data.result;
		let payload = {
			to: param[6],
			network: '9Mobile',
			sender_id: param[5],
			content: `Hello, your subscription for the ${param[4]} Service was successful. To unsubscribe, text STOP to ${param[5]}. Service costs N${param[2]} / ${param[3]} days.`,
		}

		console.log(payload)
		return this.sendSMS(payload)
    },
    
    sendUserOneOffSMS (params){
		const params = data.result;
		let payload = {
			to: params[6],
			network: '9Mobile',
			sender_id: params[5],
			content: `Hello, your opt-in for the ${params[4]} service was successful. To unsubscribe, text STOP to ${params[5]}. Service costs ${params[2]} / ${params[3]} days.`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},

	sendUserInvalidKeywordSMS (params){
		let payload = {
			to: params[6],
			network: '9Mobile',
			sender_id: params[5],
			content: `You have sent an invalid response. Please text 1 to ${params[5]} for Auto renewal or 2 for one-off purchase. Service cost N${params[2]}/ ${params[3]} days`,
		}
		return this.sendSMS(payload)
	},

	sendUserErrorGlobalSMS(msisdn, network, shortCode){
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: `Dear subscriber, something went wrong, please send HELP to ${shortCode} for more details.`,
		}
		return this.sendSMS(payload)
	},
	
	sendUserAleadySubSMS (params){
		let payload = {
			to:  params[6],
			network: '9Mobile',
			sender_id: params[5],
			content: `You are already subscribed to this service.`,
		}
		return this.sendSMS(payload)
    },
    
    sendUserBillingSMS (params){
        const { msisdn, shortCode, name, amount, validity, unsubKey } = params;

		let keyword = unsubKey || 'STOP'

		if (channel.toUpperCase() === 'USSD'){
			endMessage = `dial *${shortCode}#`;
		}
		let payload = {
			to:  msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, you have been charged ${amount} for ${name} service for ${validity} days. To unsubscribe, text ${keyword} to ${shortCode}.`,
		}
		return this.sendSMS(payload)
	},

	sendUserlowBalanceSMS(params) {
        const { msisdn, shortCode } = params;
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: 'Dear Customer, your request was not successful due to insufficient balance. Please, recharge and try again. Thank you',
		}
		return this.sendSMS(payload)
    },
    
    sendUserUnsubSMS(params) {
		const { msisdn, name, shortCode, keyword, channel } = params;

		let endMessage = `text ${keyword} to ${shortCode}`;
		if (channel.toUpperCase() === 'USSD'){
			endMessage = `dial *${shortCode}#`;
		}

		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, you have successfully unsubscribed from ${name} service. To subscribe again, ${endMessage}`,
		}
		return this.sendSMS(payload)
	},

	sendUserfailureMessage(msisdn, network, shortCode) {
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: 'Dear subscriber, your subscription request for the service cannot be processed at this point. Thank you!',
		}
		return this.sendSMS(payload)
	},
	
	sendSMS(payload){

console.log(`config url here ====  ${notificationUrl}/notification/sms`)

console.log("static url here === https://staging-api-gateway.terragonbase.com/notifications/api/notification/sms")

console.log(payload)

		return axios.post("https://staging-api-gateway.terragonbase.com/notifications/api/notification/sms", payload)
	},		
}

/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable prefer-const */
/* eslint-disable space-before-function-paren */
/* eslint-disable space-before-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger')

const axios = require('axios')
const config = require('../../config')


const notificationUrl = config.notification_service_url;


const _axios = axios.create({
	baseURL: notificationUrl,
	headers: {
		'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7ImVtYWlsVmVyaWZpZWRBdCI6IjIwMjAtMDEtMTBUMTQ6NDQ6MDkuNDI1WiIsInBob25lVmVyaWZpZWRBdCI6bnVsbCwiZW1haWwiOiJwYWpldDU4NTk2QG1haWxvbi53cyIsInJvbGUiOiJwcm9kdWN0LXByb3ZpZGVyIiwidXNlcklkIjoiNWUxODdlMWU3ZmVkMDMwMDFiNmJkZTE0Iiwibm90aWZpY2F0aW9uTGFzdFJlYWRBdCI6IjIwMjAtMDEtMjNUMTE6NTY6MDEuMzczWiIsImF1dGhJZCI6IjVlMTg3ZTFlN2ZlZDAzMDAxYjZiZGUxNSIsInByb2ZpbGUiOnsiaXNBY3RpdmUiOnRydWUsImFwcHJvdmVkIjp0cnVlLCJzdGF0dXMiOnRydWUsImNyZWF0ZWRCeSI6bnVsbCwiYXZhdGFyIjoiNWFlNWZkZTAtMzNhZS0xMWVhLWEyMjItYmY3YTk0MTA0MjkxIiwibmFtZSI6IlBhdGVrIFl1c2hudWsiLCJlbWFpbCI6InBhamV0NTg1OTZAbWFpbG9uLndzIiwiZGVzY3JpcHRpb24iOiJMb3JlbSBJcHN1bSBpcyBzaW1wbHkgZHVtbXkgdGV4dCBvZiB0aGUgcHJpbnRpbmcgYW5kIHR5cGVzZXR0aW5nIGluZHVzdHJ5LiBMb3JlbSBJcHN1bSBoYXMgYmVlbiB0aGUgaW5kdXN0cnkncyBzdGFuZGFyZCBkdW1teSB0ZXh0IGV2ZXIgc2luY2UgdGhlIDE1MDBzLCB3aGVuIGFuIHVua25vd24gcHJpbnRlciB0b29rIGEgZ2FsbGV5IG9mIHR5cGUgYW5kIHNjcmFtYmxlZCBpdCB0byBtYWtlIGEgdHlwZSBzcGVjaW1lbiBib29rLiBJdCBoYXMgc3Vydml2ZWQgbm90IG9ubHkgZml2ZSBjZW50dXJpZXMsIGJ1dCBhbHNvIHRoZSBsZWFwIGludG8gZWxlY3Ryb25pYyB0eXBlc2V0dGluZywgcmVtYWluaW5nIGVzc2VudGlhbGx5IHVuY2hhbmdlZC4gSXQgd2FzIHBvcHVsYXJpc2VkIGluIHRoZSAxOTYwcyB3aXRoIHRoZSByZWxlYXNlIG9mIExldHJhc2V0IHNoZWV0cyBjb250YWluaW5nIExvcmVtIElwc3VtIHBhc3NhZ2VzLCBhbmQgbW9yZSByZWNlbnRseSB3aXRoIGRlc2t0b3AgcHVibGlzaGluZyBzb2Z0d2FyZSBsaWtlIEFsZHVzIFBhZ2VNYWtlciBpbmNsdWRpbmcgdmVyc2lvbnMgb2YgTG9yZW0gSXBzdW0uIiwiY2FjTnVtYmVyIjoiUk4xMTExMTExMSIsImFkZHJlc3MiOiIxMiwgYmh1aWsgc3RyZWV0IiwicGhvbmVOdW1iZXIiOjIzNDgwOTg3NjU2NzYsImNyZWF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6Mzc6MzQuNzQ3WiIsInVwZGF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6NDk6MjIuMTgwWiIsInByb3ZpZGVySWQiOiI1ZTE4N2UxZTdmZWQwMzAwMWI2YmRlMTQifSwibm90aWZpY2F0aW9ucyI6W10sInJlZGlyZWN0VG8iOm51bGx9LCJpYXQiOjE1ODQzNjQzNDYsImF1ZCI6InZhcy1hZ2ciLCJpc3MiOiJ2YXMtYXV0aCIsInN1YiI6InZhcy1hZ2cifQ.cmOsu6YLWNZLT9xO6h1srYizh_PoIQ5LnTfZr4DtSB0fnJZNFJLjT4ibsRpwVKKzeMSQYaLouARNgBgoM6EMNg"
	}
})

module.exports = {

	/**
		 * Used to normalize the passed in MSISDN
		 *
		 * @param {String} phoneNumber MSISDN
		 * @param {Boolean} plus Boolean deciding whether to include + as the MSISDN prefix
		 * @returns {String} msisdn
		 */


	sendUserConsentSMS(params) {
		let { msisdn, shortCode, productName, amount, validity } = params;
		const dayValue = (validity > 1) ? 'days' : 'day';
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `You are about to subscribe to ${productName}, service costs N${amount} / ${validity} ${dayValue}. Text 1 to ${shortCode} for Auto renewal or 2 for one-off purchase to continue`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},

	sendUserSuccessMessageForUSSDSub(params) {
		let { msisdn, shortCode, serviceName, amount, validity, unsubKey } = params;
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, your subscription for the ${serviceName} service was successful. Service costs N${amount}/${validity} days. To unsubscribe, text ${unsubKey} to ${shortCode}.`,
		}

		return this.sendSMS(payload)
	},

	sendUserSmsSub(data) {
		let { msisdn, shortCode, serviceName, amount, validity, consent } = data;

		const partMessage = (consent === '1') ? 'subscription' : 'opt-in';
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, your ${partMessage} for the ${serviceName} Service was successful. To unsubscribe, text STOP to ${shortCode}. Service costs N${amount} / ${validity} days.`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},

	sendUserOneOffSMS(data) {
		let { msisdn, shortCode, serviceName, amount, validity } = data;

		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, your opt-in for the ${serviceName} service was successful. To unsubscribe, text STOP to ${shortCode}. Service costs ${amount} / ${validity} days.`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},

	sendUserInvalidKeywordSMS(params) {
		let payload = {
			to: params[6],
			network: '9Mobile',
			sender_id: params[5],
			content: `You have sent an invalid response. Please text 1 to ${params[5]} for Auto renewal or 2 for one-off purchase. Service cost N${params[2]}/ ${params[3]} days`,
		}
		return this.sendSMS(payload)
	},

	sendUserErrorGlobalSMS(msisdn, network, shortCode) {
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: `Dear subscriber, something went wrong, please send HELP to ${shortCode} for more details.`,
		}
		return this.sendSMS(payload)
	},

	sendUserAleadySubSMS(params) {
		let payload = {
			to: params[6],
			network: '9Mobile',
			sender_id: params[5],
			content: `You are already subscribed to this service.`,
		}
		return this.sendSMS(payload)
	},

	sendUserBillingSMS(params) {
		let { msisdn, shortCode, serviceName, amount, validity, unsubKey } = params;
		const dayValue = (validity > 1) ? 'days' : 'day';

		const keyword = unsubKey || 'STOP';
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, you have been charged N${amount} for ${serviceName} service for ${validity} ${dayValue}. To unsubscribe, text ${keyword} to ${shortCode}.`,
		}

		return this.sendSMS(payload)
	},

	sendUserlowBalanceSMS(params) {
		let { msisdn, shortCode } = params;
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: 'Dear Customer, your request was not successful due to insufficient balance. Please, recharge and try again. Thank you',
		}
		return this.sendSMS(payload)
	},

	sendUserUnsubSMS(params) {
		let { msisdn, shortCode, keyword, channel, productName } = params;

		let endMessage = `text ${keyword} to ${shortCode}`;
		if (channel.toUpperCase() === 'USSD') {
			endMessage = `dial *${shortCode}#`;
		}

		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, you have successfully unsubscribed from ${productName} service. To subscribe again, ${endMessage}`,
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

	sendUserAutoRenewal(data) {
		const { msisdn, shortCode, validity, amount, serviceName, unSubscriptionKeyword } = data;
		let payload = {
			to: msisdn,
			network: '9Mobile',
			sender_id: shortCode,
			content: `Hello, your ${serviceName} subscription has been renewed. Service costs N${amount} / ${validity} days. . To unsubscribe, text ${unSubscriptionKeyword} to ${shortCode}`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},

	// sendSMS(payload) {

	// 	console.log(`config url here ====  ${notificationUrl}/notification/sms`)

	// 	console.log("static url here === https://staging-api-gateway.terragonbase.com/notifications/api/notification/sms")

	// 	console.log(payload)

	// 	return axios.post("https://staging-api-gateway.terragonbase.com/notifications/api/notification/sms", payload)
	// },

	sendSMS(payload) {

		console.log(`config url here ====  ${notificationUrl}/notification/sms`)

		console.log("static url here === https://staging-api-gateway.terragonbase.com/notifications/api/notification/sms")

		console.log('PAYLOAD------', payload)

		return _axios.post(`/notification/sms`, payload)
	},
}

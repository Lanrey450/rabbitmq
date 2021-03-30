/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable prefer-const */
/* eslint-disable space-before-function-paren */
/* eslint-disable space-before-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger')

const X2JS = require('x2js')
const axios = require('axios')
const config = require('../config')

const Redis = require('../redis')

// notification endpoint for sms messages
const notificationUrl = config.notification_service_url

const _axios = axios.create({
    baseURL: notificationUrl,
	headers: {
		'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7ImVtYWlsVmVyaWZpZWRBdCI6IjIwMjAtMDEtMTBUMTQ6NDQ6MDkuNDI1WiIsInBob25lVmVyaWZpZWRBdCI6bnVsbCwiZW1haWwiOiJwYWpldDU4NTk2QG1haWxvbi53cyIsInJvbGUiOiJwcm9kdWN0LXByb3ZpZGVyIiwidXNlcklkIjoiNWUxODdlMWU3ZmVkMDMwMDFiNmJkZTE0Iiwibm90aWZpY2F0aW9uTGFzdFJlYWRBdCI6IjIwMjAtMDEtMjNUMTE6NTY6MDEuMzczWiIsImF1dGhJZCI6IjVlMTg3ZTFlN2ZlZDAzMDAxYjZiZGUxNSIsInByb2ZpbGUiOnsiaXNBY3RpdmUiOnRydWUsImFwcHJvdmVkIjp0cnVlLCJzdGF0dXMiOnRydWUsImNyZWF0ZWRCeSI6bnVsbCwiYXZhdGFyIjoiNWFlNWZkZTAtMzNhZS0xMWVhLWEyMjItYmY3YTk0MTA0MjkxIiwibmFtZSI6IlBhdGVrIFl1c2hudWsiLCJlbWFpbCI6InBhamV0NTg1OTZAbWFpbG9uLndzIiwiZGVzY3JpcHRpb24iOiJMb3JlbSBJcHN1bSBpcyBzaW1wbHkgZHVtbXkgdGV4dCBvZiB0aGUgcHJpbnRpbmcgYW5kIHR5cGVzZXR0aW5nIGluZHVzdHJ5LiBMb3JlbSBJcHN1bSBoYXMgYmVlbiB0aGUgaW5kdXN0cnkncyBzdGFuZGFyZCBkdW1teSB0ZXh0IGV2ZXIgc2luY2UgdGhlIDE1MDBzLCB3aGVuIGFuIHVua25vd24gcHJpbnRlciB0b29rIGEgZ2FsbGV5IG9mIHR5cGUgYW5kIHNjcmFtYmxlZCBpdCB0byBtYWtlIGEgdHlwZSBzcGVjaW1lbiBib29rLiBJdCBoYXMgc3Vydml2ZWQgbm90IG9ubHkgZml2ZSBjZW50dXJpZXMsIGJ1dCBhbHNvIHRoZSBsZWFwIGludG8gZWxlY3Ryb25pYyB0eXBlc2V0dGluZywgcmVtYWluaW5nIGVzc2VudGlhbGx5IHVuY2hhbmdlZC4gSXQgd2FzIHBvcHVsYXJpc2VkIGluIHRoZSAxOTYwcyB3aXRoIHRoZSByZWxlYXNlIG9mIExldHJhc2V0IHNoZWV0cyBjb250YWluaW5nIExvcmVtIElwc3VtIHBhc3NhZ2VzLCBhbmQgbW9yZSByZWNlbnRseSB3aXRoIGRlc2t0b3AgcHVibGlzaGluZyBzb2Z0d2FyZSBsaWtlIEFsZHVzIFBhZ2VNYWtlciBpbmNsdWRpbmcgdmVyc2lvbnMgb2YgTG9yZW0gSXBzdW0uIiwiY2FjTnVtYmVyIjoiUk4xMTExMTExMSIsImFkZHJlc3MiOiIxMiwgYmh1aWsgc3RyZWV0IiwicGhvbmVOdW1iZXIiOjIzNDgwOTg3NjU2NzYsImNyZWF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6Mzc6MzQuNzQ3WiIsInVwZGF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6NDk6MjIuMTgwWiIsInByb3ZpZGVySWQiOiI1ZTE4N2UxZTdmZWQwMzAwMWI2YmRlMTQifSwibm90aWZpY2F0aW9ucyI6W10sInJlZGlyZWN0VG8iOm51bGx9LCJpYXQiOjE1ODQzNjQzNDYsImF1ZCI6InZhcy1hZ2ciLCJpc3MiOiJ2YXMtYXV0aCIsInN1YiI6InZhcy1hZ2cifQ.cmOsu6YLWNZLT9xO6h1srYizh_PoIQ5LnTfZr4DtSB0fnJZNFJLjT4ibsRpwVKKzeMSQYaLouARNgBgoM6EMNg"
    }
})
/*
const _axios = require("axios").create({
    notificationUrl: notificationUrl,
    headers: {
		'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp7ImVtYWlsVmVyaWZpZWRBdCI6IjIwMjAtMDEtMTBUMTQ6NDQ6MDkuNDI1WiIsInBob25lVmVyaWZpZWRBdCI6bnVsbCwiZW1haWwiOiJwYWpldDU4NTk2QG1haWxvbi53cyIsInJvbGUiOiJwcm9kdWN0LXByb3ZpZGVyIiwidXNlcklkIjoiNWUxODdlMWU3ZmVkMDMwMDFiNmJkZTE0Iiwibm90aWZpY2F0aW9uTGFzdFJlYWRBdCI6IjIwMjAtMDEtMjNUMTE6NTY6MDEuMzczWiIsImF1dGhJZCI6IjVlMTg3ZTFlN2ZlZDAzMDAxYjZiZGUxNSIsInByb2ZpbGUiOnsiaXNBY3RpdmUiOnRydWUsImFwcHJvdmVkIjp0cnVlLCJzdGF0dXMiOnRydWUsImNyZWF0ZWRCeSI6bnVsbCwiYXZhdGFyIjoiNWFlNWZkZTAtMzNhZS0xMWVhLWEyMjItYmY3YTk0MTA0MjkxIiwibmFtZSI6IlBhdGVrIFl1c2hudWsiLCJlbWFpbCI6InBhamV0NTg1OTZAbWFpbG9uLndzIiwiZGVzY3JpcHRpb24iOiJMb3JlbSBJcHN1bSBpcyBzaW1wbHkgZHVtbXkgdGV4dCBvZiB0aGUgcHJpbnRpbmcgYW5kIHR5cGVzZXR0aW5nIGluZHVzdHJ5LiBMb3JlbSBJcHN1bSBoYXMgYmVlbiB0aGUgaW5kdXN0cnkncyBzdGFuZGFyZCBkdW1teSB0ZXh0IGV2ZXIgc2luY2UgdGhlIDE1MDBzLCB3aGVuIGFuIHVua25vd24gcHJpbnRlciB0b29rIGEgZ2FsbGV5IG9mIHR5cGUgYW5kIHNjcmFtYmxlZCBpdCB0byBtYWtlIGEgdHlwZSBzcGVjaW1lbiBib29rLiBJdCBoYXMgc3Vydml2ZWQgbm90IG9ubHkgZml2ZSBjZW50dXJpZXMsIGJ1dCBhbHNvIHRoZSBsZWFwIGludG8gZWxlY3Ryb25pYyB0eXBlc2V0dGluZywgcmVtYWluaW5nIGVzc2VudGlhbGx5IHVuY2hhbmdlZC4gSXQgd2FzIHBvcHVsYXJpc2VkIGluIHRoZSAxOTYwcyB3aXRoIHRoZSByZWxlYXNlIG9mIExldHJhc2V0IHNoZWV0cyBjb250YWluaW5nIExvcmVtIElwc3VtIHBhc3NhZ2VzLCBhbmQgbW9yZSByZWNlbnRseSB3aXRoIGRlc2t0b3AgcHVibGlzaGluZyBzb2Z0d2FyZSBsaWtlIEFsZHVzIFBhZ2VNYWtlciBpbmNsdWRpbmcgdmVyc2lvbnMgb2YgTG9yZW0gSXBzdW0uIiwiY2FjTnVtYmVyIjoiUk4xMTExMTExMSIsImFkZHJlc3MiOiIxMiwgYmh1aWsgc3RyZWV0IiwicGhvbmVOdW1iZXIiOjIzNDgwOTg3NjU2NzYsImNyZWF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6Mzc6MzQuNzQ3WiIsInVwZGF0ZWRBdCI6IjIwMjAtMDEtMTBUMTM6NDk6MjIuMTgwWiIsInByb3ZpZGVySWQiOiI1ZTE4N2UxZTdmZWQwMzAwMWI2YmRlMTQifSwibm90aWZpY2F0aW9ucyI6W10sInJlZGlyZWN0VG8iOm51bGx9LCJpYXQiOjE1ODQzNjQzNDYsImF1ZCI6InZhcy1hZ2ciLCJpc3MiOiJ2YXMtYXV0aCIsInN1YiI6InZhcy1hZ2cifQ.cmOsu6YLWNZLT9xO6h1srYizh_PoIQ5LnTfZr4DtSB0fnJZNFJLjT4ibsRpwVKKzeMSQYaLouARNgBgoM6EMNg"
    }
});
*/

module.exports = {

	/**
     * Used to normalize the passed in MSISDN
     *
     * @param {String} phoneNumber MSISDN
     * @param {Boolean} plus Boolean deciding whether to include + as the MSISDN prefix
     * @returns {String} msisdn
     */

	 now(unit){

		const hrTime = process.hrtime();

		let response = '';
	  
		switch (unit) {
	  
		  case 'milli':
			response = hrTime[0] * 1000 + hrTime[1] / 1000000
			return response.toString()
	  
		  case 'micro':
			response = hrTime[0] * 1000 + hrTime[1] / 1000
			return response.toString()
	  
		  case 'nano':
			response = hrTime[0] * 1000000000 + hrTime[1];
			return response.toString()
	  
		  default:
			return now('nano').toString()
		}
	  
	  },

	msisdnSanitizer(phoneNumber, plus) {
		let msisdn = phoneNumber
		if (msisdn) {
			if (msisdn.length === 14) {
				msisdn = `234${msisdn.substr(4)}`
			}
        
			msisdn = msisdn.replace(/\s+/g, '')
			msisdn = msisdn.replace('+', '')
        
			if (!Number.isNaN(msisdn)) {
				if (msisdn.match(/^234/i)) {
					msisdn = `0${msisdn.substr(3)}`
				}
        
				if (msisdn.length === 11) {
					msisdn = `+234${msisdn.substr(1)}`
        
					if (!plus) {
						msisdn = msisdn.replace('+', '')
					}
        
					return msisdn
				}
        
				return ''
			}
        
			return ''
		}
        
		return ''
	},

	//  authenticate request parameters
	authenticateParams(passedJson, neededFields){
		let missingFields = []
		neededFields.forEach((element) => {
			if (!passedJson[element]){
				missingFields.push(element)
			}
		})
		return missingFields
	},

	/**
   * Used to convert XML data to JSON
   *
   * @param {String} xmlData
   * @returns {Object} JSON formatted data
   */
	xmltoJSON(xmlData) {
		return new X2JS().xml2js(this.xmlSanitizer(xmlData))
	}, 

	/**
   * Cleans up XML by removing CDATA and false strings
   * @param {String} xmlData
   * @returns {String} cleaned up XML
   */
	xmlSanitizer(xmlData) {
		return xmlData.toString('utf8').replace(/(&lt;)/g, '<').replace(/(&gt;)/g, '>').replace('<![CDATA[', '')
			.replace(']]>', '')
	},

	/**
     * Return serviceId from keyword saved in Redis
     * @param {String} keyword 
     */
	async getServiceIdFromKeyword(keyword) {
		const serviceId = await Redis.getAsync(keyword)
			.then((rkeyword) => {
				TerraLogger.debug(rkeyword, 'keyword from redis')
				return rkeyword
			}).catch((error) => {
				TerraLogger.debug(error, 'Error getting serviceID from redis')
			})
		TerraLogger.debug(serviceId, '++++++ validKeyword from Redis Store')
		return serviceId
	},


	/**
   * Sanitizes the keyword to get of rid of spaces
   *
   * @param {String} keywordParam
   * @returns {String} Keyword trimmed of all spaces and formatted for saving
   */
	keywordSanitizer(keywordParam) {
		return keywordParam.trim().replace(/ +/g, '_').toUpperCase()
	},


	sendUSSDConsentSMS (msisdn, network, shortCode){

		/**
		 * TODO: get service name somehow
		 */
		const serviceName = 'CELEBRITY GIST'
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			
			content: `You are about to subscribe to ${serviceName} , Text 1 to ${shortCode} for auto renewal or 2 for one-off purchase to continue.`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},


	sendUserConsentSMS (msisdn, network, shortCode){
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: `Dear subscriber, please reply to this shortcode, ${shortCode} with the keyword, 1 for auto renewal or 2 for one-off.`,
		}

		console.log(payload)
		return this.sendSMS(payload)
	},

	sendUserErrorSMS (msisdn, network, shortCode){
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: `Dear subscriber, you have sent an invalid keyword, please send HELP to ${shortCode} for more details.`,
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
	
	sendUserAleadySubSMS (msisdn, network, shortCode){
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: `Dear subscriber, you are already subscribed to this service, please send HELP to ${shortCode} for more details.`,
		}
		return this.sendSMS(payload)
	},

	sendUserSuccessSMS(msisdn, network, shortCode) {
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: 'Dear subscriber, your subscription request for the service was successful. Thank you!',
		}
		return this.sendSMS(payload)
	},
	
	sendSMS(payload){

console.log(`config url here ====  ${notificationUrl}/notification/sms`)

console.log("static url here === https://staging-api-gateway.terragonbase.com/notifications/api/notification/sms")

console.log('PAYLOAD------', payload)

		return _axios.post(`/notification/sms`, payload)
	},		
}

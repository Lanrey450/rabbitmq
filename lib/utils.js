/* eslint-disable prefer-const */
/* eslint-disable space-before-function-paren */
/* eslint-disable space-before-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
const R = require('ramda')
const X2JS = require('x2js')
const axios = require('axios')
const config = require('../config')

const notificationUrl = config.notification_service_url

module.exports = {

	/**
     * Used to normalize the passed in MSISDN
     *
     * @param {String} phoneNumber MSISDN
     * @param {Boolean} plus Boolean deciding whether to include + as the MSISDN prefix
     * @returns {String} msisdn
     */


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

	/**
 * Used to validate that a service object contain all the necessary
 * properties that are needed to make a call to the Airtel's IBM Subscription Engine.
 *
 * @param service
 * @returns {{error: boolean, errors: Array}}
 */
	// eslint-disable-next-line space-before-blocks
	validateServiceInfo(service){
		const errors = []
  
		if (!R.prop('product', service) || R.isEmpty(service.product)) {
			errors.push('product was not profiled with this service')
		}
  
		if (!R.prop('shortCode', service) || R.isEmpty(service.shortCode)) {
			errors.push('shortCode was not profiled with this service')
		}
  
		if (!R.prop('productIds', service) || R.isEmpty(service.productIds)) {
			errors.push('productIds was not profiled for this service')
		}
  
		const isError = errors.length > 0
		return {
			error: isError,
			errors,
		}
	},
	/**
   * Used to convert XML data to JSON
   *
   * @param {String} xmlData
   * @returns {Object} JSON formatted data
   */
	xmltoJSON(xmlData) {
		const x2js = new X2JS()
		return x2js.xml2js(this.xmlSanitizer(xmlData))
	}, 

	/**
   * Cleans up XML by removing CDATA and false strings
   * @param {String} xmlData
   * @returns {String} cleaned up XML
   */
	xmlSanitizer(xmlData) {
		return xmlData.toString('utf8')
			.replace(/(&lt;)/g, '<')
			.replace(/(&gt;)/g, '>')
			.replace('<![CDATA[', '')
			.replace(']]>', '')
	},

	/**
   * Sanitizes the keyword to get  rid of spaces
   *
   * @param {String} keywordParam
   * @returns {String} Keyword trimmed of all spaces and formatted for saving
   */
	keywordSanitizer(keywordParam) {
		return keywordParam.trim()
			.replace(/ +/g, '_')
			.toUpperCase()
	},

	sendUserConsentSMS (msisdn, keyword, sms){
		let payload = {
			to: msisdn,
			sender_id: sms.shortCode,
			content: `Dear subscriber, please reply to this shortcode, ${sms.shortCode} with this keyword, ${keyword}.`,
		}
		return this.sendSMS(payload)
	},

	sendUserSessionSMS (msisdn){
		let payload = {
			to: msisdn,
			content: 'Dear subscriber, please reply with 1 for a one-off subscription or with 2 for autorenewal.',
		}
		return this.sendSMS(payload)
	},

	sendUserErrorSMS (msisdn){
		let payload = {
			to: msisdn,
			content: 'Dear subscriber, you have sent an invalid keyword, please send HELP for more details.',
		}
		return this.sendSMS(payload)
	}, 

	sendUserSuccessSMS(msisdn) {
		let payload = {
			to: msisdn,
			content: 'Dear subscriber, your subscription request for the Service was success',
		}
		return this.sendSMS(payload)
	},
	
	sendSMS(payload){
		return axios.post(`${notificationUrl}/notification/sms`, payload)
	},
	
}

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


	sendUserConsentSMS (msisdn, network, shortCode){
		let payload = {
			to: msisdn,
			network,
			sender_id: shortCode,
			content: `Dear subscriber, please reply to this shortcode, ${shortCode} with the keyword, 1 for auto renewal or 2 for one-off.`,
		}
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
		return axios.post(`${notificationUrl}/notification/sms`, payload)
	},
	
}

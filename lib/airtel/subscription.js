/* eslint-disable arrow-parens */
/* eslint-disable object-curly-newline */
/* eslint-disable indent */
/* eslint-disable object-curly-spacing */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-tabs */
/* eslint-disable import/no-extraneous-dependencies */

const Axios = require('axios')
const moment = require('moment')
const TerraLogger = require('terra-logger')
const config = require('../../config')
const Utils = require('../utils')


const publish = require('../../rabbitmq/producer')

const mongoDBClientHelper = require('../../models/airtel/subscription')


module.exports = {
	/**
     * Send a subscription request using Axios to Airtel's SE
     *
     * @param msisdn Phone number to subscribe
     * @param service Service - contains the productId
     * @param channel Source of subscription request [sms, ussd, web]
     *  @returns {Promise}
     */
	sendSubscriptionRequest(msisdn, channel, service, requestId) {
		return new Promise((resolve, reject) => {
			const { product } = service

			const sanitizedMsisdn = Utils.msisdnSanitizer(msisdn)

			const channelName = channel.toUpperCase()

			// form subscription url
			const soapURL = config.airtel_options.endpoints.subscription
				.replace('<IP>', config.airtel_options.host)
				.replace('<PORT>', config.airtel_options.port)

			// format xml payload for the subscription call
			const xmlRequestPayload = config.airtel_options.soap_xml.subscription
				// eslint-disable-next-line radix
				.replace('[cp_id]', parseInt(config.airtel.cpID))
				.replace('[cp_password]', config.airtel.cpPassword)
				.replace('[cp_name]', config.airtel.cpName)
				.replace('[channel_name]', channelName)
				.replace('[msisdn]', sanitizedMsisdn)
				.replace('[product_id]', product.productId)
				.replace('[firstConfirmationDTTM]', moment().toISOString())


			// Send a POST request to Airtel SE using Axios
			return Axios({
				method: 'post',
				url: `${soapURL}`,
				headers: {SOAPAction: 'CallSubscription', Accept: 'text/xml', 'Content-Type': 'text/xml' },
				data: `${xmlRequestPayload}`,
			}).then((response) => {
				if (response && response.data) {
					const responseString = response.data.toString('utf8')


					let responseJsonData = Utils.xmltoJSON(responseString)

					responseJsonData = responseJsonData.Envelope.Body.handleNewSubscriptionResponse.handleNewSubscriptionReturn

					switch (responseJsonData.errorCode) {
					case '5021': {
						// successfully subscribed user, push to queue records
						const subscriptionData = {
							msisdn,
							productId: responseJsonData.productId,
							amount: parseFloat(responseJsonData.amount),
							status: config.user_status.active,
							type: config.airtel_request_type.sub,
							chargingTime: responseJsonData.chargigTime,
							transactionId: responseJsonData.xactionId,
							channel,
							requestId,
						}
						TerraLogger.debug(subscriptionData, 'subscriptiondata')
						// push the data to a queue so we can save later as request logs or write to database
						return publish(config.rabbit_mq.airtel.subscription_queue, {...subscriptionData })
							.then(() => {
								TerraLogger.debug('successfully pushed to the Airtel subscription data queue')
								return resolve({
									error: false,
									response: subscriptionData,
								})
							})
					}
					case '3003': {
						const error = {
							error: true,
							message: ' Error occurred while subscribing user on Airtel SE\'s end - USER_ALREADY_SUBSCRIBED',
							response: responseJsonData,
						}
						return reject(error)
					}
					case '3004': {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end - PRODUCT_NOT_MAPPED_TO_CP',
							response: responseJsonData,
						}
						return reject(error)
					}
					case '3006': {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end - AIRTEL_DUPLICATE_REQUEST',
							response: responseJsonData,
						}
						return reject(error)
					}
					case '3101': {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end - INVALID_SUBSCRIBER',
							response: responseJsonData,
						}
						return reject(error)
					}
					case '3109': {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end - AIRTEL_CHARGING_ERROR',
							response: responseJsonData,
						}
						return reject(error)
					}
					case '7002': {
						const error = {
							error: true,
							message: 'Error occurred while unsubscribing user on Airtel SE\'s end - RESPONSE_IS_ALREADY_PENDING_FOR_SUBSCRIBER',
						}
						return reject(error)
					}
					case '3000': {
						const error = {
							error: true,
							message: 'Error occurred while unsubscribing user on Airtel SE\'s end - AIRTEL_INTERNAL_ERROR',
						}
						return reject(error)
					}
					case '3404': {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end - USER_BALANCE_INSUFFICIENT',
							response: responseJsonData,
						}
						return reject(error)
					}
					case '4000': {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end - AIRTEL_INTERNAL_ERROR',
							response: responseJsonData,
						}
						return reject(error)
					}
					default: {
						const error = {
							error: true,
							message: 'Error occurred while subscribing user on Airtel SE\'s end',
							response: responseJsonData,
						}
						return reject(error)
					}
					}
				}
				const error = {
					error: true,
					message: 'EMPTY_RESPONSE_FROM_AIRTEL',
				}
				return reject(error)
			}).catch((error) => reject(error))
		})
	},


	/**
     * Send an unsubscription request using SOAP to the Airtel's SE
     *
     * @param msisdn Phone number to unsusbcribe
     * @param service Service contains the productId
     * @param channel Source of Unsubscription Request [sms, ussd, web]
     *  @returns {Promise}
     */
	sendUnSubscriptionRequest(msisdn, service, channel, requestId) {
		return new Promise((resolve, reject) => {
			const { product } = service

			const sanitizedMsisdn = Utils.msisdnSanitizer(msisdn)

			// form airtel subscription engine url
			const soapURL = config.airtel_options.endpoints.subscription
				.replace('<IP>', config.airtel_options.host)
				.replace('<PORT>', config.airtel_options.port)

			// format xml paylaod for soap call to the engine
			const xmlRequestPayload = config.airtel_options.soap_xml.un_subscription
				// eslint-disable-next-line radix
				.replace('[cp_id]', parseInt(config.airtel.cpID))
				.replace('[cp_password]', config.airtel.cpPassword)
				.replace('[msisdn]', sanitizedMsisdn)
				.replace('[product_id]', product.productId)


			// Send soap request using Axios to Airtel's SE
			return Axios({
				method: 'post',
				url: `${soapURL}`,
				headers: { SOAPAction: 'CallSubscription', Accept: 'text/xml', 'Content-Type': 'text/xml' },
				data: `${xmlRequestPayload}`,
			}).then((response) => {
				if (response && response.data) {
					const responseString = response.data.toString('utf8')

					let responseJsonData = Utils.xmltoJSON(responseString)

				responseJsonData = responseJsonData.Envelope.Body.handleDeSubscriptionResponse.handleDeSubscriptionReturn
					switch (responseJsonData.errorCode) {
					case '1001': {
						// successfully unsubscribed user, update our records
						const unsubscriptionData = {
							msisdn,
							productId: product.productId,
							status: config.user_status.inactive,
							type: config.airtel_request_type.unsub,
							chargingTime: responseJsonData.chargigTime,
							amount: responseJsonData.amount,
							transactionId: responseJsonData.xactionId,
							message: responseJsonData.errorMsg,
							lowBalance: responseJsonData.lowBalance,
							temp1: responseJsonData.temp1,
							temp2: responseJsonData.temp2,
							channel,
							requestId,
						}

						// push the data to a queue so we can save later as request logs
						return publish(config.rabbit_mq.airtel.un_subscription_queue, {...unsubscriptionData })
							.then(() => {
								TerraLogger.debug('successfully pushed to the Airtel SE Request data queue')
								return resolve({
									error: false,
									response: unsubscriptionData,
								})
							})
							.catch((error) => {
								TerraLogger.debug(`could not push Airtel SE Requests to queue: ${error}`)
								return resolve({
									error: false,
									response: unsubscriptionData,
								})
							})
					}
					case '3016': {
						const error = {
							error: true,
							message: 'USER_NOT_SUBSCRIBED',
						}
						return reject(error)
					}
					case '3020': {
						const error = {
							error: true,
							message: 'USER_NOT_SUBSCRIBED',
						}
						return reject(error)
					}
					case '3015': {
						const error = {
							error: true,
							message: 'INVALID_PRODUCT_ID',
						}
						return reject(error)
					}
					case '3000': {
						const error = {
							error: true,
							message: 'Error occurred while unsubscribing user on Airtel SE\'s end - AIRTEL_INTERNAL_ERROR',
						}
						return reject(error)
					}
					default: {
						const error = {
							error: true,
							message: 'Error occurred while unsubscribing user on Airtel SE\'s end',
						}
						return reject(error)
					}
					}
				}
				return reject('EMPTY_RESPONSE_FROM_AIRTEL')
			}).catch((error) => reject(error))
		})
	},

	//  get user subscription status from the database
	getSubscriptionStatus(msisdn, productId) {
		return new Promise((resolve, reject) => {
			const sanitizedMsisdn = Utils.msisdnSanitizer(msisdn)
			const params = {}
			params.conditions = { sanitizedMsisdn, productId }
			return mongoDBClientHelper.findOne(params)
				.then((response) => resolve(response))
				.catch((error) => reject(error))
		})
	},

}

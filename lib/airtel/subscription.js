/* eslint-disable arrow-parens */
/* eslint-disable object-curly-newline */
/* eslint-disable indent */
/* eslint-disable object-curly-spacing */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-tabs */
/* eslint-disable import/no-extraneous-dependencies */

const Axios = require('axios')
const moment = require('moment')
const config = require('../../config')
const Utils = require('../utils')

const publish = require('../../rabbitmq/producer')

const mongoDBClientHelper = require('../../models/airtel/subscription')


module.exports = {
	// eslint-disable-next-line no-tabs
	/**
     * Send a subscription request using Axios to Airtel's SE
     *
     * @param msisdn Phone number to subscribe
     * @param service Service object
     * @param channel Source of subscription request
     *  @returns {Promise}
     */
	sendSubscriptionRequest(msisdn, channel, service) {
		console.log(msisdn, channel, service)
		return new Promise((resolve, reject) => {

			const { product } = service

			console.log(service)

			const channelName = channel.toUpperCase()

			const soapURL = config.airtel_options.endpoints.subscription
				.replace('<IP>', config.airtel_options.host)
				.replace('<PORT>', config.airtel_options.port)

			console.log(soapURL, 'soapuRL')

			const xmlRequestPayload = config.airtel_options.soap_xml.subscription
				// eslint-disable-next-line radix
				.replace('[cp_id]', parseInt(config.airtel.cpID))
				.replace('[cp_password]', config.airtel.cpPassword)
				.replace('[cp_name]', config.airtel.cpName)
				.replace('[channel_name]', channelName)
				.replace('[msisdn]', msisdn)
				.replace('[product_id]', product.productId)
				.replace('[firstConfirmationDTTM]', moment().toISOString())

				console.log(xmlRequestPayload, 'soapuRL')

			// Send a POST request
			return Axios({
				method: 'post',
				url: `${soapURL}`,
				headers: {SOAPAction: 'CallSubscription', Accept: 'text/xml', 'Content-Type': 'text/xml' },
				data: `${xmlRequestPayload}`,
			}).then((response) => {
				console.log(response, 'response string')

				if (response && response.body) {
					const responseString = response.body.toString('utf8')

					console.log(`Subscription SOAP Response Body for ${xmlRequestPayload} === ${responseString}`)

					let responseJsonData = Utils.xmltoJSON(responseString)

					console.log(responseJsonData, 'responsedata')

					responseJsonData = responseJsonData
						.Envelope
						.Body
						.handleNewSubscriptionResponse
						.handleNewSubscriptionReturn

					switch (responseJsonData.errorCode) {
					case '1000': {
						// successfully subscribed user, update our records
						const subscriptionData = {
							msisdn,
							productId: responseJsonData.productId,
							amount: parseFloat(responseJsonData.amount),
							status: config.user_status.active,
							type: config.airtel_request_type.sub,
							chargingTime: responseJsonData.chargigTime,
							response: responseString,
							transactionId: responseJsonData.xactionId,
							channel,
							action: 'subscribe',
						}
						// push the data to a queue so we can save later as request logs or write to database
						return publish(config.rabbit_mq.airtel.subscription_queue, subscriptionData)
							.then((status) => {
								console.info(`successfully pushed to the Airtel subscription data queue: ${status}`)
								return resolve({
									error: false,
									message: `Subscription is successful for ${service.name}`,
									response: subscriptionData,
								})
							})
					}
					case '3003': {
						// eslint-disable-next-line prefer-promise-reject-errors
						return reject('USER_ALREADY_SUBSCRIBED')
					}
					case '3004': {
						return reject('PRODUCT_NOT_MAPPED_TO_CP')
					}
					case '3006': {
						return reject('AIRTEL_DUPLICATE_REQUEST')
					}
					case '3101': {
						return reject('INVALID_SUBSCRIBER')
					}
					case '3109': {
						return reject('AIRTEL_CHARGING_ERROR')
					}
					case '3404': {
						return reject('USER_BALANCE_INSUFFICIENT')
					}
					case '4000': {
						return reject('AIRTEL_INTERNAL_ERROR')
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
				return reject('EMPTY_RESPONSE_FROM_AIRTEL')
			}).catch((error) => {
				console.log(error, 'errrrrrrrrrrrrrrrrrrrrrrrrrr')
				return reject(error)
			})
		})
	},


	/**
     * Send an unsubscription request using SOAP to the Airtel's SE
     *
     * @param msisdn Phone number to unsusbcribe
     * @param service Service Object
     * @param channel Source of Unsubscription Request
     *  @returns {Promise}
     */
	sendUnSubscriptionRequest(msisdn, service, channel) {
		return new Promise((resolve, reject) => {
			const { product } = service

			const soapURL = config.airtel_options.endpoints.subscription
				.replace('<IP>', config.airtel_options.host)
				.replace('<PORT>', config.airtel_options.port)

			const xmlRequestPayload = config.airtel_options.soap_xml.un_subscription
				// eslint-disable-next-line radix
				.replace('[cp_id]', parseInt(config.airtel.cpID))
				.replace('[cp_password]', config.airtel.cpPassword)
				.replace('[msisdn]', msisdn)
				.replace('[product_id]', product.productId)


			// Send soap request here to Airtel's SE
			return Axios({
				method: 'post',
				url: `${soapURL}`,
				headers: { SOAPAction: 'CallSubscription', Accept: 'application/xml', 'Content-Type': 'application/xml' },
				data: `${xmlRequestPayload}`,
			}).then((response) => {
				// something came back as the response...
				if (response && response.body) {
					const responseString = response.body.toString('utf8')

					console.log(`Unsubscription SOAP Response Body for ${xmlRequestPayload} === ${responseString}`)

					let responseJsonData = Utils.xmltoJSON(responseString)

					responseJsonData = responseJsonData
						.Envelope
						.Body
						.handleDeSubscriptionResponse
						.handleDeSubscriptionReturn

					switch (responseJsonData.errorCode) {
					case '1001': {
						// successfully unsubscribed user, update our records
						const unsubscriptionData = {
							msisdn,
							productId: product.productId,
							status: config.user_status.inactive,
							type: config.airtel_request_type.unsub,
							chargingTime: responseJsonData.chargigTime,
							response: responseString,
							transactionId: responseJsonData.xactionId,
							channel,
							action: 'unsubscribe',
						}

						// push the data to a queue so we can save later as request logs
						return publish(config.rabbit_mq.airtel.un_subscription_queue, unsubscriptionData)
							.then((status) => {
								console.log(`successfully pushed to the Airtel SE Requests data queue : ${status}`)
								return resolve({
									error: false,
									message: 'Unsubscription was successful',
									response: unsubscriptionData,
								})
							})
							.catch((error) => {
								console.log(`could not push Airtel SE Requests to queue to be saved later in MongoDB: ${error}`)
								return resolve({
									error: false,
									message: 'Unsubscription was successful',
									response: unsubscriptionData,
								})
							})
					}
					case '3016': {
						return reject('USER_NOT_SUBSCRIBED')
					}
					case '3020': {
						return reject('USER_NOT_SUBSCRIBED')
					}
					case '3015': {
						return reject('INVALID_PRODUCT_ID')
					}
					case '3000': {
						return reject('AIRTEL_INTERNAL_ERROR')
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
			}).catch((error) => {
				console.log('error')
				return reject(error)
			})
		})
	},


	/**
	 * consumes from queue and Saves the subscription data into MongoDB or
     * updates the record if it already exists.
     *
     * @param subscriptionData - Object containing requests parameters and values
     * @returns {Promise}
     */
	createUserSubscription(subscriptionData) {
		const userSubscriptionData = subscriptionData
		if (!userSubscriptionData.msisdn || !userSubscriptionData.serviceObject) {
			// provide valid subscription_data
			console.error('provide valid subscription_data')
			throw new Error('provide valid subscription_data')
		}
		// create a new subscription here..
		// set the subscription status to new since the user is a new subscriber...
		return mongoDBClientHelper.create(userSubscriptionData)
			.then((savedData) => {
				// eslint-disable-next-line no-underscore-dangle
				if (savedData._id) {
					return savedData.toObject()
				}
				throw new Error(savedData)
			})
	},


	getSubscriptionStatus(msisdn, serviceId) {
		return new Promise((resolve, reject) => {
			const params = {}
			params.conditions = { msisdn, serviceId }
			return mongoDBClientHelper.findOne(params)
				.then((response) => resolve(response))
				.catch((error) => reject(error))
		})
	},

}

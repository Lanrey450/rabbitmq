/* eslint-disable no-tabs */
const publish = require('../../rabbitmq/producer')
// const TerraLogger = require('terra-logger')
const config = require('../../config')


module.exports = {
	

	async optin(req, res) {
		console.log('optin request')
		console.log(req.body)
		let bodyToQueue = {
			'source' : 'optin',
			'data' : req.body
		}
		try {
			publish(config.rabbit_mq.nineMobile.postback_queue, bodyToQueue)
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}
		res.send('ok')
	},

	async optout(req, res) {
		console.log('optout request')
		console.log(req.body)
		let bodyToQueue = {
			'source' : 'optout',
			'data' : req.body
		}
		try {
			publish(config.rabbit_mq.nineMobile.postback_queue, bodyToQueue)
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}
		res.send('ok')
	},

	async chargeAsync(req, res) {
		console.log('charge async request')
		console.log(req.body)
		let bodyToQueue = {
			'source' : 'chargeAsync',
			'data' : req.body
		}
		try {
			publish(config.rabbit_mq.nineMobile.postback_queue, bodyToQueue)
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}
		res.send('ok')
	},

	async consent(req, res) {
		console.log('consent request')
		console.log(req.body)
		let bodyToQueue = {
			'source' : 'consent',
			'data' : req.body
		}
		try {
			publish(config.rabbit_mq.nineMobile.postback_queue, bodyToQueue)
				.then(() => {
					console.log('successfully pushed to the 9mobile postback queue')
				})
		} catch (err) {
			console.log(`unable to push data to 9mobile postback queue :: ${err}`)
		}
		res.send('ok')
	},

	// async mtRequest(req, res) {
	// 	console.log('mt request')
	// 	console.log(req.body)
	// 	try {
	// 		publish(config.rabbit_mq.nineMobile.postback_queue, req.body)
	// 			.then(() => {
	// 				console.log('successfully pushed to the 9MOBILE unsubscription data queue')
	// 			})
	// 	} catch (err) {
	// 		console.log(`unable to push unsubscription data to queue :: ${err}`)
	// 	}

	// 	res.send('ok')
	// },

	// async userRenewedRequest(req, res) {
	// 	console.log('user-renewed request')
	// 	console.log(req.body)
	// 	res.send('ok')
	// },

	// async chargeDOBRequest(req, res) {
	// 	console.log('charge-dob request')
	// 	console.log(req.body)
	// 	res.send('ok')
	// },
}

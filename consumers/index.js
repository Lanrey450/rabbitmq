/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable no-tabs */
const axios = require('axios')
// MTN
const SubscriptionModelMTN = require('../models/mtn/subscription')
const UnSubscriptionModelMTN = require('../models/mtn/subscription')
const PostbackModelMTN = require('../models/mtn/subscription')
// AIRTEL
const SubscriptionModelAIRTEL = require('../models/airtel/subscription')
const UnSubscriptionModelAIRTEL = require('../models/airtel/unsubscription')
const PostbackModelAIRTEL = require('../models/mtn/subscription')
// NINE MOBILE
const SubscriptionModelNINE_MOBILE = require('../models/mtn/subscription')
const UnSubscriptionModelNINE_MOBILE = require('../models/mtn/subscription')
const PostbackModelNINE_MOBILE = require('../models/mtn/subscription')

const consume = require('../rabbitmq/consumer')
const config = require('../config')

module.exports = {
	// Some of the mongodb schemas are not ready, as we are not sure yet, what will be on their queue.
	// MTN CONSUMERS
	saveConsumedSubscriptionDataMTN() {
		const feedbackUrl = config.feedbackUrl.mtnFeedbackURL
		consumeHandler(feedbackUrl, config.rabbit_mq.mtn.subscription_queue, SubscriptionModelMTN)
	},
	saveConsumedUnSubscriptionDataMTN() {
		consumeHandler(null, config.rabbit_mq.mtn.un_subscription_queue, UnSubscriptionModelMTN)
	},
	saveConsumedPostbackDataMTN() {
		consumeHandler(null, config.rabbit_mq.mtn.postback_queue, PostbackModelMTN)
	},

	// AIRTEL CONSUMERS
	saveConsumedSubscriptionDataAIRTEL() {
		const feedbackUrl = config.feedbackUrl.airtelFeedbackURL
		consumeHandler(feedbackUrl, config.rabbit_mq.airtel.postback_queue, SubscriptionModelAIRTEL)
	},
	saveConsumedUnsubscriptionDataAIRTEL() {
		consumeHandler(null, config.rabbit_mq.airtel.postback_queue, UnSubscriptionModelAIRTEL)
	},
	saveConsumedPostbackDataAIRTEL() {
		consumeHandler(null, config.rabbit_mq.airtel.postback_queue, PostbackModelAIRTEL)
	},

	// NINE MOBILE CONSUMERS
	saveConsumedSubscriptionData9Mobile() {
		const feedbackUrl = config.feedbackUrl.ninemobilePostFeedbackURL
		const queue = config.rabbit_mq.nineMobile.subscription_queue
		consumeHandler(feedbackUrl, queue, SubscriptionModelNINE_MOBILE)
	},
	saveConsumedUnsubscriptionData9Mobile() {
		const queue = config.rabbit_mq.nineMobile.un_subscription_queue
		consumeHandler(null, queue, UnSubscriptionModelNINE_MOBILE)
	},
	saveConsumedPostbackData9Mobile() {
		const feedbackUrl = config.feedbackUrl.ninemobilePostFeedbackURL
		const queue = config.rabbit_mq.nineMobile.postback_queue
		consumeHandler(feedbackUrl, queue, PostbackModelNINE_MOBILE)
	},
}

function consumeHandler(feedbackUrl, queue, model) {
	consume(queue, async (err, msg) => {
		if (err) {
			console.log(`rabbitmq connection failed! - ${err}`)
			return
		}
		if (msg == null) {
			console.log('the queue is empty at the moment ')
			return
		}
		if (msg != null && feedbackUrl != null) {
			try {
				const resp = await sendFeedbackToAggregator(feedbackUrl, msg)
				if (resp) {
					msg.feedbackStatus = true
					try {
						const data = await model.create(msg)
						if (data) {
							console.log(`Successfully saved to db with flag TRUE! - ${data}`)
						}
					} catch (error) {
						console.log(`unable to save data to mongodb - ${error}`)
					}
				}
			} catch (feedbackError) {
				console.log(feedbackError)
				msg.feedbackStatus = false
				try {
					const data = await model.create(msg)
					if (data) {
						console.log(`Successfully saved to db with flag FALSE! - ${data}`)
					}
				} catch (error) {
					console.log(`unable to save data to mongodb - ${error}`)
				}
			}
			return
		}
		if (msg != null && feedbackUrl == null) {
			try {
				const data = await model.create(msg)
				if (data) {
					console.log(`Successfully saved to db! - ${data}`)
				}
			} catch (error) {
				console.log(`unable to save data to mongodb - ${error}`)
			}
		}
	})
}

async function sendFeedbackToAggregator(feedbackUrl, body) {
	return (await axios.post(feedbackUrl, body, {
	})).data
}

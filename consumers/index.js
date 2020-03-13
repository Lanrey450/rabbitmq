/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable no-tabs */
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
const publish = require('../rabbitmq/producer')

module.exports = {
	// Some of the mongodb schemas are not ready, as we are not sure yet, what will be on their queue.
	// MTN CONSUMERS
	saveConsumedSubscriptionDataMTN() {
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.mtn.subscription_queue
		const type = 'MTN'
		consumeHandler(feedbackQueue, queue, SubscriptionModelMTN, type)
	},
	saveConsumedUnSubscriptionDataMTN() {
		consumeHandler(null, config.rabbit_mq.mtn.un_subscription_queue, UnSubscriptionModelMTN)
	},
	saveConsumedPostbackDataMTN() {
		consumeHandler(null, config.rabbit_mq.mtn.postback_queue, PostbackModelMTN)
	},

	// AIRTEL CONSUMERS
	saveConsumedSubscriptionDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.postback_queue
		const type = 'AIRTEL'
		consumeHandler(feedbackQueue, queue, SubscriptionModelAIRTEL, type)
	},
	saveConsumedUnsubscriptionDataAIRTEL() {
		const queue = config.rabbit_mq.airtel.postback_queue
		consumeHandler(null, queue, UnSubscriptionModelAIRTEL)
	},
	saveConsumedPostbackDataAIRTEL() {
		const queue = config.rabbit_mq.airtel.postback_queue
		consumeHandler(null, queue, PostbackModelAIRTEL)
	},

	// NINE MOBILE CONSUMERS
	saveConsumedSubscriptionData9Mobile() {
		console.log('!!!!!!!reaching consumer engine from 9mobile sub...!!!!!!!!!')
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.nineMobile.subscription_queue
		const type = '9MOBILE'
		consumeHandler(feedbackQueue, queue, SubscriptionModelNINE_MOBILE, type)
	},
	saveConsumedUnsubscriptionData9Mobile() {
		const feedbackQueue = config.feedbackQueues.UnsubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.nineMobile.un_subscription_queue
		const type = '9MOBILE'
		consumeHandler(feedbackQueue, queue, UnSubscriptionModelNINE_MOBILE, type)
	},
	saveConsumedPostbackData9Mobile() {
		const feedbackQueue = config.feedbackQueues.BillingFeedbackQUEUE
		const queue = config.rabbit_mq.nineMobile.postback_queue
		const type = '9MOBILE'
		consumeHandler(feedbackQueue, queue, PostbackModelNINE_MOBILE, type)
	},
}

function consumeHandler(feedbackQueue, consumerQueue, model, _type = '') {
	consume(consumerQueue, async (err, msg) => {
		console.log('!!!!!!!reaching consumer engine...!!!!!!!!!')
		if (err) {
			console.log(`rabbitmq connection failed! - ${err}`)
			return
		}
		if (msg == null) {
			console.log('the queue is empty at the moment ')
			return
		}
		if (msg != null && feedbackQueue != null) {
			try {
				msg.type = _type
				await publish(feedbackQueue, msg)
				console.log('Successfully pushed to feedback queue')
				msg.feedbackStatus = true
				delete msg.type
				try {
					console.log(msg)
					const data = await model.create(msg)
					if (data) {
						delete msg.feedbackStatus
						console.log(`Successfully saved to db with flag TRUE! - ${data}`)
					}
				} catch (error) {
					console.log(`unable to save data to mongodb - ${error}`)
				}
			} catch (feedbackPublishError) {
				console.log(`unable to push feedback to queue${feedbackPublishError}`)
				msg.feedbackStatus = false
				try {
					const data = await model.create(msg)
					if (data) {
						delete msg.feedbackStatus
						console.log(`Successfully saved to db with flag FALSE! - ${data}`)
					}
				} catch (error) {
					console.log(`unable to save data to mongodb - ${error}`)
				}
			}
			return
		}
		if (msg != null && feedbackQueue == null) {
			try {
				msg.feedbackStatus = false
				const data = await model.create(msg)
				console.log(`Successfully saved to db! - ${data}`)
			} catch (error) {
				console.log(`unable to save data to mongodb - ${error}`)
			}
		}
	})
}

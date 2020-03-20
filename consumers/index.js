/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger')
// MTN
const SubscriptionModelMTN = require('../models/mtn/subscription')
const UnSubscriptionModelMTN = require('../models/mtn/subscription')
const PostbackModelMTN = require('../models/mtn/subscription')
// AIRTEL
const SubscriptionModelAIRTEL = require('../models/airtel/subscription')
const UnSubscriptionModelAIRTEL = require('../models/airtel/subscription')
const PostbackModelAIRTEL = require('../models/airtel/postback')
// NINE MOBILE
const SubscriptionModelNINE_MOBILE = require('../models/9Mobile/subscription')
const UnSubscriptionModelNINE_MOBILE = require('../models/9Mobile/subscription')
const PostbackModelNINE_MOBILE = require('../models/9Mobile/subscription')

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
		const feedbackQueue = config.feedbackQueues.UnsubscriptionFeedbackQUEUE
		const type = 'MTN'
		const queue = config.rabbit_mq.mtn.un_subscription_queue
		consumeHandler(feedbackQueue, queue, UnSubscriptionModelMTN, type)
	},
	saveConsumedPostbackDataMTN() {
		const feedbackQueue = config.feedbackQueues.BillingFeedbackQUEUE
		const type = 'MTN'
		const queue = config.rabbit_mq.mtn.postback_queue
		consumeHandler(feedbackQueue, queue, PostbackModelMTN, type)
	},

	// AIRTEL CONSUMERS
	saveConsumedSubscriptionDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.postback_queue
		const type = 'AIRTEL'
		consumeHandler(feedbackQueue, queue, SubscriptionModelAIRTEL, type)
	},
	saveConsumedUnsubscriptionDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.UnsubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.un_subscription_queue
		const type = 'AIRTEL'
		consumeHandler(feedbackQueue, queue, UnSubscriptionModelAIRTEL, type)
	},
	saveConsumedPostbackDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.BillingFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.postback_queue
<<<<<<< HEAD
		const type = 'AIRTEL'
		consumeHandler(feedbackQueue, queue, PostbackModelAIRTEL, type)
=======
		consumeHandler(null, queue, PostbackModelAIRTEL)
		// TODO
>>>>>>> 4cb408e4f6aba95e701d614bf1e7cff5d032d651
	},

	// NINE MOBILE CONSUMERS
	saveConsumedSubscriptionData9Mobile() {
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
		TerraLogger.debug('!!!!!!!reaching consumer engine...!!!!!!!!!')
		if (err) {
			TerraLogger.debug(`rabbitmq connection failed! - ${err}`)
			return
		}
		if (msg == null) {
			TerraLogger.debug('the queue is empty at the moment ')
			return
		}
		if (msg != null && feedbackQueue != null) {
			try {
				msg.type = _type
				await publish(feedbackQueue, msg)
				TerraLogger.debug('Successfully pushed to feedback queue')
				msg.feedbackStatus = true
				delete msg.type
				try {
					TerraLogger.debug(msg)
					const data = await model.create(msg)
					if (data) {
						delete msg.feedbackStatus
						TerraLogger.debug(`Successfully saved to db with flag TRUE! - ${data}`)
					}
				} catch (error) {
					TerraLogger.debug(`unable to save data to mongodb - ${error}`)
				}
			} catch (feedbackPublishError) {
				TerraLogger.debug(`unable to push feedback to queue${feedbackPublishError}`)
				msg.feedbackStatus = false
				try {
					const data = await model.create(msg)
					if (data) {
						delete msg.feedbackStatus
						TerraLogger.debug(`Successfully saved to db with flag FALSE! - ${data}`)
					}
				} catch (error) {
					TerraLogger.debug(`unable to save data to mongodb - ${error}`)
				}
			}
			return
		}
		if (msg != null && feedbackQueue == null) {
			try {
				msg.feedbackStatus = false
				const data = await model.create(msg)
				TerraLogger.debug(`Successfully saved to db! - ${data}`)
			} catch (error) {
				TerraLogger.debug(`unable to save data to mongodb - ${error}`)
			}
		}
	})
}

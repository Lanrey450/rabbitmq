/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable no-tabs */
const TerraLogger = require('terra-logger')
require('../mongoClient')

// MTN
const MtnSubscriptionModel = require('../models/mtn/subscription')


// AIRTEL
const AirtelSubscriptionModel = require('../models/airtel/subscription')
const AirtelPostbackModel = require('../models/airtel/postback')

// NINE MOBILE
const NineMobileSubscriptionModel = require('../models/9Mobile/subscription')


const consume = require('../rabbitmq/consumer')
const config = require('../config')
const publish = require('../rabbitmq/producer')

module.exports = {

	// MTN CONSUMERS
	saveConsumedSubscriptionDataMTN() {
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.mtn.subscription_queue
		consumeHandler(feedbackQueue, queue, MtnSubscriptionModel)
	},
	saveConsumedUnSubscriptionDataMTN() {
		const feedbackQueue = config.feedbackQueues.UnsubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.mtn.un_subscription_queue
		consumeHandler(feedbackQueue, queue, MtnSubscriptionModel)
	},
	saveConsumedPostbackDataMTN() {
		const feedbackQueue = config.feedbackQueues.BillingFeedbackQUEUE
		const queue = config.rabbit_mq.mtn.postback_queue
		consumeHandler(feedbackQueue, queue, MtnSubscriptionModel)
	},

	// AIRTEL CONSUMERS
	saveConsumedSubscriptionDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.subscription_queue
		consumeHandler(feedbackQueue, queue, AirtelSubscriptionModel)
	},
	saveConsumedUnsubscriptionDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.UnsubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.un_subscription_queue
		consumeHandler(feedbackQueue, queue, AirtelSubscriptionModel)
	},
	saveConsumedPostbackDataAIRTEL() {
		const feedbackQueue = config.feedbackQueues.BillingFeedbackQUEUE
		const queue = config.rabbit_mq.airtel.postback_queue
		consumeHandler(feedbackQueue, queue, AirtelPostbackModel)
	},

	// NINE MOBILE CONSUMERS
	saveConsumedSubscriptionData9Mobile() {
		const feedbackQueue = config.feedbackQueues.SubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.nineMobile.subscription_queue
		consumeHandler(feedbackQueue, queue, NineMobileSubscriptionModel)
	},
	saveConsumedUnsubscriptionData9Mobile() {
		const feedbackQueue = config.feedbackQueues.UnsubscriptionFeedbackQUEUE
		const queue = config.rabbit_mq.nineMobile.un_subscription_queue
		consumeHandler(feedbackQueue, queue, NineMobileSubscriptionModel)
	},
	saveConsumedPostbackData9Mobile() {
		const feedbackQueue = config.feedbackQueues.BillingFeedbackQUEUE
		const queue = config.rabbit_mq.nineMobile.postback_queue
		consumeHandler(feedbackQueue, queue, NineMobileSubscriptionModel)
	},
}

function consumeHandler(feedbackQueue, consumerQueue, model) {
	consume(consumerQueue, async (err, msg) => {
		TerraLogger.debug('!!!!!!!reaching consumer engine...!!!!!!!!!')
		if (err) {
			TerraLogger.debug(`rabbitmq connection failed! - ${err}`)
			return
		}
		if (msg == null) {
			TerraLogger.debug('the queue is empty at the moment')
			return
		}
		if (msg != null && feedbackQueue != null) {
			try {
				await publish(feedbackQueue, msg)
				TerraLogger.debug('Successfully pushed to feedback queue')
				msg.feedbackStatus = true
				try {
					TerraLogger.debug(msg)
					const data = await model.create(msg)
					delete msg.feedbackStatus
					TerraLogger.debug(`Successfully saved to db with flag TRUE! - ${data}`)
				} catch (error) {
					TerraLogger.debug(`unable to save data to mongodb - ${error}`)
				}
			} catch (feedbackPublishError) {
				TerraLogger.debug(`unable to push feedback to queue - ${feedbackPublishError}`)
				msg.feedbackStatus = false
				// save to databse regardless
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

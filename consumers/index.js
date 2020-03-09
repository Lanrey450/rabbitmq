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

module.exports = {
	// Some of the mongodb schemas are not ready, as we are not sure yet, what will be on their queue.
	// MTN CONSUMERS
	saveConsumedSubscriptionDataMTN() {
		consumeHandler(config.rabbit_mq.mtn.subscription_queue, SubscriptionModelMTN)
	},
	saveConsumedUnSubscriptionDataMTN() {
		consumeHandler(config.rabbit_mq.mtn.un_subscription_queue, UnSubscriptionModelMTN)
	},
	saveConsumedPostbackDataMTN() {
		consumeHandler(config.rabbit_mq.mtn.postback_queue, PostbackModelMTN)
	},

	// AIRTEL CONSUMERS
	saveConsumedSubscriptionDataAIRTEL() {
		consumeHandler(config.rabbit_mq.airtel.postback_queue, SubscriptionModelAIRTEL)
	},
	saveConsumedUnsubscriptionDataAIRTEL() {
		consumeHandler(config.rabbit_mq.airtel.postback_queue, UnSubscriptionModelAIRTEL)
	},
	saveConsumedPostbackDataAIRTEL() {
		consumeHandler(config.rabbit_mq.airtel.postback_queue, PostbackModelAIRTEL)
	},

	// NINE MOBILE CONSUMERS
	saveConsumedSubscriptionData9Mobile() {
		consumeHandler(config.rabbit_mq.nineMobile.postback_queue, SubscriptionModelNINE_MOBILE)
	},
	saveConsumedUnsubscriptionData9Mobile() {
		consumeHandler(config.rabbit_mq.nineMobile.postback_queue, UnSubscriptionModelNINE_MOBILE)
	},
	saveConsumedPostbackData9Mobile() {
		consumeHandler(config.rabbit_mq.nineMobile.postback_queue, PostbackModelNINE_MOBILE)
	},
}

function consumeHandler(queue, model) {
	consume(queue, async (err, msg) => {
		if (err) {
			console.log(`rabbitmq connection failed! - ${err}`)
			return
		}
		if (msg == null) {
			console.log('the queue is empty at the moment ')
			return
		}
		if (msg != null) {
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

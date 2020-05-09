/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const subscriptionSchema = new Schema({
	message: {
		type: String,
	},
	msisdn: {
		type: String,
	},
	serviceId: {
		type: String,
	},
	action: {
		type: String,
	},
	status: {
		type: String,
	},
	network: {
		type: String,
	},
	transactionId: {
		type: String,
	},
	meta: {
		type: [Object],
	},
	feedbackStatus: {
		type: Boolean,
	},
}, {
	timestamps: true,
})

const SubscriptionModel = mongoose.model('nineMobilesubscription', subscriptionSchema)

module.exports = SubscriptionModel

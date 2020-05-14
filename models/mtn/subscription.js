/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const subscriptionSchema = new Schema({
	message: {
		type: String,
	},
	serviceId: {
		type: String,
		required: true,
	},
	msisdn: {
		type: String,
		required: true,
	},
	transactionId: {
		type: Number,
	},
	meta: {
		type: [Object],
		required: true,
	},
	feedbackStatus: {
		type: Boolean,
	},
	action: {
		type: String,
	},
	network: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
})
const SubscriptionModel = mongoose.model('mtn', subscriptionSchema)

module.exports = SubscriptionModel

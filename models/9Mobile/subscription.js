/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const subscriptionSchema = new Schema({
	service_name: {
		type: String,
		required: true,
	},
	msisdn: {
		type: String,
		required: true,
	},
	transactionId: {
		type: Date,
		required: true,
	},
	operator: {
		type: String,
		required: true,
	},
	subscriptionResult: {
		type: String,
	},
	subscription_date: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
}, {
	timestamps: true,
})

const SubscriptionModel = mongoose.model('nineMobilesubscription', subscriptionSchema)

module.exports = SubscriptionModel

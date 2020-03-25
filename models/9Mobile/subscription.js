/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const subscriptionSchema = new Schema({
	message: {
		type: String,
		required: true,
	},
	inError: {
		type: Boolean,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	transactionId: {
		type: String,
		required: true,
	},
	subscriptionResult: {
		type: String,
	},
	externalTxId: {
		type: String,
		required: true,
	},
	subscriptionError: {
		type: String,
		required: true,
	},
}, {
	timestamps: true,
})

const SubscriptionModel = mongoose.model('nineMobilesubscription', subscriptionSchema)

module.exports = SubscriptionModel

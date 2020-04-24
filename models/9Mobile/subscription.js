/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const subscriptionSchema = new Schema({
	message: {
		type: String,
	},
	userIdentifier: {
		type: String,
	},
	serviceId: {
		type: String,
	},
	entryChannel: {
		type: String,
	},
	inError: {
		type: Boolean,
	},
	code: {
		type: String,
	},
	transactionId: {
		type: String,
	},
	transactionUUID: {
		type: String,
	},
	subscriptionResult: {
		type: String,
	},
	externalTxId: {
		type: String,
	},
	validity: {
		type: String,
	},
	operation: {
		type: String,
	},
	mnoDeliveryCode: {
		type: String,
	},
	subscriptionError: {
		type: String,
	},
}, {
	timestamps: true,
})

const SubscriptionModel = mongoose.model('nineMobilesubscription', subscriptionSchema)

module.exports = SubscriptionModel

/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const subscriptionSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
}, {
	timestamps: true,
})

const SubscriptionModel = mongoose.model('nineMobile', subscriptionSchema)

module.exports = SubscriptionModel

/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const postbackSchema = new Schema({
	transactionId: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
	meta: {
		type: [Object],
		required: true,
	},
	network: {
		type: String,
		required: true,
	},
	feedbackStatus: {
		type: Boolean,
	},
	message: {
		type: String,
	},
	msisdn: {
		type: String,
		required: true,
	},
	serviceId: {
		type: Number,
		required: true,
	},
})
const PostbackModel = mongoose.model('airtelpostback', postbackSchema)

module.exports = PostbackModel

/* eslint-disable no-tabs */
const mongoose = require('mongoose')

const { Schema } = mongoose


const postbackSchema = new Schema({
	xactionId: {
		type: Number,
		required: true,
	},
	errorCode: {
		type: Number,
		required: true,
	},
	errorMsg: {
		type: String,
		required: true,
	},
	temp1: {
		type: String,
		required: true,
	},
	temp2: {
		type: String,
		required: true,
	},
	temp3: {
		type: String,
		required: true,
	},
	lowBalance: {
		type: Number,
		required: true,
	},
	amount: {
		type: String,
		required: true,
	},
	chargigTime: {
		type: Date,
		required: true,
	},
	msisdn: {
		type: String,
		required: true,
	},
	productId: {
		type: Number,
		required: true,
	},
})
const PostbackModel = mongoose.model('airtelpostback', postbackSchema)

module.exports = PostbackModel

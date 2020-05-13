/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require('mongoose')

const { Schema } = mongoose

const subscriptionSchemaAirtel = new Schema({
  msisdn: {
    type: String,
    required: true,
  },
  serviceId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  meta: {
    type: [Object],
  },
  network: {
		type: String,
		required: true,
	},
  message: {
    type: String,
  },
  feedbackStatus: {
		type: Boolean,
	},
  action: {
    type: String,
  },
})


const SubscriptionModel = mongoose.model('airtelsubscription', subscriptionSchemaAirtel)

module.exports = SubscriptionModel

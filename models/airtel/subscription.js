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
    required: true,
  },
  network: {
    type: String,
  },
  message: {
    type: String,
  },
  feedbackStatus: {
		type: Boolean,
	},
  action: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})


const SubscriptionModel = mongoose.model('airtelsubscription', subscriptionSchemaAirtel)

module.exports = SubscriptionModel

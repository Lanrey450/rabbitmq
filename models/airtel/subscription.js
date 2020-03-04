/* eslint-disable indent */
const mongoose = require('mongoose')

const { Schema } = mongoose

const subscriptionSchemaAirtel = new Schema({
  msisdn: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'active', 'inactive', 'renew', 'suspended'],
    required: true,
  },
  chargingTime: {
    type: Date,
  },
  response: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    sparse: true,
    unique: true,
  },
  channel: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
}, {
  timestamps: true,
})


const SubscriptionModel = mongoose.model('subscription', subscriptionSchemaAirtel)

module.exports = SubscriptionModel

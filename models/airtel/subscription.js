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
  transactionId: {
    type: String,
    sparse: true,
    unique: true,
  },
  channel: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
  lowBalance: {
    type: String,
  },
  temp1: {
    type: String,
  },
  temp2: {
    type: String,
  },
}, {
  timestamps: true,
})


const SubscriptionModel = mongoose.model('airtelsubscription', subscriptionSchemaAirtel)

module.exports = SubscriptionModel

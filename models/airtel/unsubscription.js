/* eslint-disable indent */
const mongoose = require('mongoose')

const { Schema } = mongoose

const unsubscriptionSchemaAirtel = new Schema({
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
}, {
  timestamps: true,
})


const UnsubscriptionModel = mongoose.model('unsubscription', unsubscriptionSchemaAirtel)

module.exports = UnsubscriptionModel

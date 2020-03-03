const mongoose = require('mongoose');

const { Schema } = mongoose;


const subscriptionSchema =  new Schema({
    service_name: {
        type: String,
        required: true
    },
    service_id: {
        type: String,
        required: true
    },
    msisdn: {
        type: String,
        required: true
    },
    expiry_date: {
        type: Date,
        required: true
    },
    duration: {
        type: Date,
        required: true
    },
    operator: {
        type: String,
        required: true
    },
    renewal_date: {
        type: Date,
        required: true
    },
    subscription_date:{
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
  });
const SubscriptionModel = mongoose.model('mtn', subscriptionSchema);

module.exports = SubscriptionModel;
const mongoose = require('mongoose');

const { Schema } = mongoose;


const subscriptionSchemaAirtel = new Schema({
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
});

const SubscriptionModel = mongoose.model('subscription', subscriptionSchemaAirtel);

module.exports = SubscriptionModel;
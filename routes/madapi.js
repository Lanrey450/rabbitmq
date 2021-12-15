const express = require('express')

const route = express.Router()
const asyncHandler = require('express-async-handler')
const MTNMadapiController = require('../controllers/mtn/madapi');


route.post('/madapi-sms-outbound', asyncHandler((req, res) => MTNMadapiController.smsOutbound(req, res)))

route.post('/subscribe/:shortcode', asyncHandler((req, res) => MTNMadapiController.subscribeShortcode(req, res)))

route.get('/unsubscribe/:shortcode/:requestId', asyncHandler((req, res) => MTNMadapiController.unSbscribeShortcode(req, res)));

route.get('/mtn/oauth', asyncHandler((req, res) => MTNMadapiController.getToken(req, res)));

route.get('/mtn/delivery-status/:shortCode/:requestId', asyncHandler((req, res) => MTNMadapiController.getDeliveryStatus(req, res)));

route.get('/subscriptions/:customerId', asyncHandler((req, res) => MTNMadapiController.getCustomerSubscriptions(req, res)));

route.get('/subscriptions/:customerId/subscriptionId', asyncHandler((req, res) => MTNMadapiController.getCustomerSubscription(req, res)));

route.post('/subscriptions/:customerId', asyncHandler((req, res) => MTNMadapiController.subscribeUser(req, res)));

route.delete('/subscriptions/:customerId', asyncHandler((req, res) => MTNMadapiController.deleteAllSubscriptions(req, res)));

route.delete('/subscriptions/:customerId/subscriptionId', asyncHandler((req, res) => MTNMadapiController.deleteSubscription(req, res)));





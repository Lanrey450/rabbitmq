/* eslint-disable camelcase */
const express = require('express')

const route = express.Router()
const asyncHandler = require('express-async-handler')
const NineMOBILESubscriptionController = require('../controllers/9Mobile/subscription')
const AirtelSubscriptionController = require('../controllers/airtel/subscription')
const MTNSubscriptionController = require('../controllers/mtn/subscription')


const NineMOBILE_MO_Controller = require('../controllers/9Mobile/userConsentLayer')


// Nine mobile subscription
route.post('/nineMobile/subscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.subscribe(req, res)))
route.post('/nineMobile/unsubscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.unsubscribe(req, res)))
route.post('/nineMobile/status', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)))

route.post('/nineMobile/mo', asyncHandler((req, res) => NineMOBILE_MO_Controller.userConsent(req, res)))


// postabck 9Mobile (called by telco)
route.post('/nineMobile/billing/feedback', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)))

// Airtel sub
route.post('/airtel/subscribe', asyncHandler((req, res) => AirtelSubscriptionController.subscribeRequest(req, res)))
route.post('/airtel/unsubscribe', asyncHandler((req, res) => AirtelSubscriptionController.unSubscribeRequest(req, res)))
route.post('/airtel/status', asyncHandler((req, res) => AirtelSubscriptionController.getSubscriptionStatus(req, res)))


route.post('/airtelPostBack', asyncHandler((req, res) => AirtelSubscriptionController.airtelDataSyncPostBack(req, res)))

// MTN sub
route.post('/mtn/subscribe', asyncHandler((req, res) => MTNSubscriptionController.subscribe(req, res)))
route.post('/mtn/unsubscribe', asyncHandler((req, res) => MTNSubscriptionController.unsubscribe(req, res)))
route.post('/mtn/status', asyncHandler((req, res) => MTNSubscriptionController.status(req, res)))

route.post('/mtnPostBack', asyncHandler((req, res) => MTNSubscriptionController.MTNDataSyncPostBack(req, res)))


module.exports = route

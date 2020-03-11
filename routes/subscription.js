/* eslint-disable no-tabs */
/* eslint-disable camelcase */
const express = require('express')

const route = express.Router()
const asyncHandler = require('express-async-handler')
const NineMOBILESubscriptionController = require('../controllers/9Mobile/subscription')
const AirtelSubscriptionController = require('../controllers/airtel/subscription')
const MTNSubscriptionController = require('../controllers/mtn/subscription')
const NineMobilePostbackController = require('../controllers/9Mobile/postbackHandler')
const NineMOBILE_MO_Controller = require('../controllers/9Mobile/userConsentLayer')
const NinemobileChargeController = require('../controllers/9Mobile/charge')


// Nine mobile subscription
route.post('/nineMobile/subscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.subscribe(req, res)))
route.post('/nineMobile/unsubscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.unsubscribe(req, res)))
route.post('/nineMobile/status', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)))

route.post('/nineMobile/sms/mo', asyncHandler((req, res) => NineMOBILE_MO_Controller.userConsent(req, res)))

// Nine mobile postback
route.post('/nineMobile/mt/dn/', asyncHandler((req, res) => NineMobilePostbackController.mtRequest(req, res)))
route.post('/nineMobile/optin/', asyncHandler((req, res) => NineMobilePostbackController.optinRequest(req, res)))
route.post('/nineMobile/optout/', asyncHandler((req, res) => NineMobilePostbackController.optoutRequest(req, res)))
route.post('/nineMobile/user-renewed/', asyncHandler((req, res) => NineMobilePostbackController.userRenewedRequest(req, res)))
route.post('/nineMobile/charge/dob/', asyncHandler((req, res) => NineMobilePostbackController.chargeDOBRequest(req, res)))
route.post('/nineMobile/charge/async/', asyncHandler((req, res) => NineMobilePostbackController.chargeAsyncRequest(req, res)))
route.post('/nineMobile/consent/', asyncHandler((req, res) => NineMobilePostbackController.consentmoRequest(req, res)))

// charge sync and async
route.post('/nineMobile/sync', asyncHandler((req, res) => NinemobileChargeController.chargeSync(req, res)))
route.post('/nineMobile/async', asyncHandler((req, res) => NinemobileChargeController.chargeAsync(req, res)))


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

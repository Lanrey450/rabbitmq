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
route.get('/nineMobile/status', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)))


// billing sync and async
route.post('/nineMobile/billing/sync', asyncHandler((req, res) => NinemobileChargeController.chargeSync(req, res)))
route.post('/nineMobile/billing/async', asyncHandler((req, res) => NinemobileChargeController.chargeAsync(req, res)))


// Nine mobile SMS-MO(INCOMING FROM TELCO)
route.post('/nineMobile/sms/mo', asyncHandler((req, res) => NineMOBILE_MO_Controller.userConsent(req, res)))


// Nine mobile postback (INCOMING FROM TELCO)
route.post('/nineMobile/subscription/optout', asyncHandler((req, res) => NineMobilePostbackController.optout(req, res)))
route.post('/nineMobile/charge/async', asyncHandler((req, res) => NineMobilePostbackController.chargeAsync(req, res)))
route.post('/nineMobile/subscription/optin', asyncHandler((req, res) => NineMobilePostbackController.optin(req, res)))
route.post('/nineMobile/consent', asyncHandler((req, res) => NineMobilePostbackController.consent(req, res)))


// postback 9Mobile (called by telco)  // duplicate
// route.post('/nineMobile/billing/feedback', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res))) 


// Airtel sub
route.post('/airtel/subscribe', asyncHandler((req, res) => AirtelSubscriptionController.subscribeRequest(req, res)))
route.post('/airtel/unsubscribe', asyncHandler((req, res) => AirtelSubscriptionController.unSubscribeRequest(req, res)))
route.get('/airtel/status', asyncHandler((req, res) => AirtelSubscriptionController.getSubscriptionStatus(req, res)))


// Airtel postback (INCOMING FROM TELCO)
// Airtel soap request postback endpoint '/airtelPostback' being handled in server.js file
route.post('/airtelPostBack', asyncHandler((req, res) => AirtelSubscriptionController.AirtelPostBack(req, res)))

// MTN sub
route.post('/mtn/subscribe', asyncHandler((req, res) => MTNSubscriptionController.subscribe(req, res)))
route.post('/mtn/unsubscribe', asyncHandler((req, res) => MTNSubscriptionController.unsubscribe(req, res)))
route.get('/mtn/status', asyncHandler((req, res) => MTNSubscriptionController.status(req, res)))

// sms mt - manulaly initiated by application developer - done 
route.post('/mtn/sendSms', asyncHandler((req, res) => MTNSubscriptionController.sendSms(req, res))) 

// sms mo stop  -- endpoint to call to stop receiving DRL webhook for the registered soap-url 
route.post('/mtn/stopSMSNotification', asyncHandler((req, res) => MTNSubscriptionController.stopSMSNotification(req, res)))

// ussd mt - manually initiated 
route.post('/mtn/sendUssd', asyncHandler((req, res) => MTNSubscriptionController.sendUssd(req, res)))

// ussd mo start-- endpoint to call to register the notify soap url in the config with the telco to start receiving DRL/webhook (notifyUssdReceptionRequest) - handles user initiated part 
route.post('/mtn/startUSSDNotificationRequest', asyncHandler((req, res) => MTNSubscriptionController.startUssdMo(req, res)))

// ussd mo stop -- endpoint to call to stop receiving DRL webhook for the registered soap-url - done 
route.post('/mtn/stopUSSDNotification', asyncHandler((req, res) => MTNSubscriptionController.stopUssdMo(req, res)))

// mtn postback (INCOMING FROM TELCO)
route.post('/mtnPostBack', asyncHandler((req, res) => MTNSubscriptionController.MTNDataSyncPostBack(req, res)))


module.exports = route

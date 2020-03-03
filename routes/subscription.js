const express = require('express');
const route = express.Router();
const asyncHandler = require('express-async-handler');
const NineMOBILESubscriptionController = require('../controllers/9Mobile/subscription');
const AirtelSubscriptionController = require('../controllers/airtel/subscription');
const MTNSubscriptionController = require('../controllers/mtn/subscription');


// 9mobile sub
route.post('/nineMobile/subscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.subscribe(req, res)));
route.post('/nineMobile/unsubscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.unsubscribe(req, res)));
route.post('/nineMobile/status', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)));

// Airtel sub
route.post('/airtel/subscribe', asyncHandler((req, res) => AirtelSubscriptionController.subscribeRequest(req, res)));
route.post('/airtel/unsubscribe', asyncHandler((req, res) => AirtelSubscriptionController.unSubscribeRequest(req, res)));
route.post('/airtel/status', asyncHandler((req, res) => AirtelSubscriptionController.getSubscriptionStatus(req, res)));

route.post('/airtelPostBack', asyncHandler((req, res) => AirtelSubscriptionController.airtelDataSyncPostBack(req, res)));




// MTN sub
route.post('/mtn/subscribe', asyncHandler((req, res) => MTNSubscriptionController.subscribe(req, res)));
route.post('/mtn/unsubscribe', asyncHandler((req, res) => MTNSubscriptionController.unsubscribe(req, res)));
route.post('/mtn/status', asyncHandler((req, res) => MTNSubscriptionController.status(req, res)));


route.post('/mtnPostBack', asyncHandler((req, res) => MTNSubscriptionController.MTNDataSyncPostBack(req, res)));


module.exports = route;
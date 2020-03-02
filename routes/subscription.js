const express = require('express');
const route = express.Router();
const asyncHandler = require('express-async-handler');
const NineMOBILESubscriptionController = require('../controllers/9Mobile/subscription');
const AirtelSubscriptionController = require('../controllers/airtel/subscription');
const MTNSubscriptionController = require('../controllers/mtn/subscription');



// Nine mobile subscription
route.post('/subscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.subscribe(req, res)));
route.post('/unsubscribe', asyncHandler((req, res) => NineMOBILESubscriptionController.unsubscribe(req, res)));
route.post('/status', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)));



// Airtel sub
route.post('/subscribe', asyncHandler((req, res) => AirtelSubscriptionController.subscribe(req, res)));
route.post('/unsubscribe', asyncHandler((req, res) => AirtelSubscriptionController.unsubscribe(req, res)));
route.post('/status', asyncHandler((req, res) => AirtelSubscriptionController.status(req, res)));



// MTN sub
route.post('/mtn', asyncHandler((req, res) => MTNSubscriptionController.subscribe(req, res)));
route.post('/mtnun', asyncHandler((req, res) => MTNSubscriptionController.unsubscribe(req, res)));
route.post('/mtnst', asyncHandler((req, res) => MTNSubscriptionController.status(req, res)));


module.exports = route;
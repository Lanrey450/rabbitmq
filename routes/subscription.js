const express = require('express');
const route = express.Router();
const asyncHandler = require('express-async-handler');
const SubscriptionController = require('../controllers/9Mobile/subscription');

route.post('/subscribe', asyncHandler((req, res) => SubscriptionController.subscribe(req, res)));
route.post('/unsubscribe', asyncHandler((req, res) => SubscriptionController.unsubscribe(req, res)));
route.post('/status', asyncHandler((req, res) => SubscriptionController.status(req, res)));


module.exports = route;
const express = require('express');
const route = express.Router();
const asyncHandler = require('express-async-handler');

const ChargeController = require('../controllers/9Mobile/charge');

route.post('/sync', asyncHandler((req, res) => ChargeController.chargeSync(req, res)));
route.post('/async', asyncHandler((req, res) => ChargeController.chargeAsync(req, res)));



module.exports = route;
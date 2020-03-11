const express = require('express')
const route = express.Router()
const asyncHandler = require('express-async-handler')

const NinemobileChargeController = require('../controllers/9Mobile/charge')

// charge sync and async
route.post('/nineMobile/sync', asyncHandler((req, res) => NinemobileChargeController.chargeSync(req, res)))
route.post('/nineMobile/async', asyncHandler((req, res) => NinemobileChargeController.chargeAsync(req, res)))


module.exports = route

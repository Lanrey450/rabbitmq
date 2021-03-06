/* eslint-disable no-tabs */
/* eslint-disable camelcase */
const express = require('express')

const route = express.Router()
const asyncHandler = require('express-async-handler')

const NineMobilePostbackController = require('../controllers/9Mobile/postbackHandler')



// Nine mobile postback (INCOMING FROM TELCO)
route.post('/subscription/optout/106', asyncHandler((req, res) => NineMobilePostbackController.optout(req, res)))
route.post('/charge/async/106', asyncHandler((req, res) => NineMobilePostbackController.chargeAsync(req, res)))
route.post('/subscription/optin/106', asyncHandler((req, res) => NineMobilePostbackController.optin(req, res)))
route.post('/subscription/consent/106', asyncHandler((req, res) => NineMobilePostbackController.consent(req, res)))


// postback 9Mobile (called by telco)  // duplicate
// route.post('/nineMobile/billing/feedback', asyncHandler((req, res) => NineMOBILESubscriptionController.status(req, res)))


module.exports = route

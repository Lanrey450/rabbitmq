const express = require('express')

const route = express.Router()
const asyncHandler = require('express-async-handler')

const MTNSubscriptionController = require('../controllers/mtn/subscription')

route.post('/', asyncHandler((req, res) => MTNSubscriptionController.welcome(req, res)))

module.exports = route

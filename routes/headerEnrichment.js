const express = require('express')

const route = express.Router()
const asyncHandler = require('express-async-handler')
const HeaderController = require('../controllers/mtn/headerEnrichment');

route.get('/', asyncHandler((req, res) => HeaderController.headerEnrichment(req, res)));

module.exports = route;

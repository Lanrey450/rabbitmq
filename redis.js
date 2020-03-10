/* eslint-disable import/prefer-default-export */
const redis = require('redis')

const Redis = redis.createClient()

module.exports = Redis

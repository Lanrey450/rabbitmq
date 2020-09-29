/* eslint-disable arrow-parens */
/* eslint-disable indent */
/* eslint-disable import/prefer-default-export */

const redis = require('redis')
const TerraLogger = require('terra-logger')
const bluebird = require('bluebird')
const config = require('./config')

bluebird.promisifyAll(redis.RedisClient.prototype)

const Redis = redis.createClient(config.redisClientConnection.port,
    config.redisClientConnection.host, { no_ready_check: true })

    // Redis.auth(config.redisClientConnection.password)
    Redis.on('error', error => TerraLogger.debug('Error Connecting to the Redis Cluster', error))

    // add redis ping at intervals 
    setInterval(() => {
        console.log('Keeping alive subscription')
        Redis.set('ping', 'pong')
    }, 1000 * 60 * 4)

    Redis.on('connect', () => {
        TerraLogger.debug('Successfully connected to the Redis cluster!')
})

module.exports = Redis

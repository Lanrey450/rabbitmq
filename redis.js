/* eslint-disable arrow-parens */
/* eslint-disable indent */
/* eslint-disable import/prefer-default-export */
const redis = require('redis')
const config = require('./config')

const Redis = redis.createClient(config.redisClientConnection.port,
    config.redisClientConnection.host, { no_ready_check: true })

    Redis.auth(config.redisClientConnection.password)
    Redis.on('error', error => console.error('Error Connecting to the Redis Cluster', error))
    Redis.on('connect', () => {
        console.log('Successfully connected to the Redis cluster!')
})

module.exports = Redis

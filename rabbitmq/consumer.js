/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
const amqp = require('amqplib')
const TerraLogger = require('terra-logger')
const config = require('../config')

const consumeFromQueue = async (queue, callback) => {
	try {
		TerraLogger.debug('Welcome to the consumer engine')
		const cluster = await amqp.connect(`amqp://${config.rabbit_mq.user}:${config.rabbit_mq.pass}@${config.rabbit_mq.host}:${config.rabbit_mq.port}/${config.rabbit_mq.vhost}`)
		const channel = await cluster.createChannel()
		await channel.assertQueue(queue, { durable: true, noAck: false })
		await channel.consume(queue, (msg) => {
			TerraLogger.debug(`just consumed from queue: ${queue}`)
			channel.ack(msg)
			const data = JSON.parse(msg.content)
			TerraLogger.debug('*************')
			return callback(null, data)
		})
	} catch (error) {
		// handle error response
		TerraLogger.debug(error, 'Unable to connect to cluster!')
		return callback(error, null)
	}
}
module.exports = consumeFromQueue

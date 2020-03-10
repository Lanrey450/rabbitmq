/* eslint-disable no-tabs */
const amqp = require('amqplib')
const config = require('../config')

const consumeFromQueue = async (queue, callback) => {
	try {
		const cluster = await amqp.connect(`amqp://${config.rabbit_mq.user}:${config.rabbit_mq.pass}@${config.rabbit_mq.host}:${config.rabbit_mq.port}/${config.rabbit_mq.vhost}`)
		const channel = await cluster.createChannel()
		await channel.assertQueue(queue, { durable: true, noAck: false })
		await channel.consume(queue, (msg) => {
			channel.ack(msg)
			const data = JSON.parse(msg.content)
			callback(null, data)
		})
		await channel.close()
	} catch (error) {
		// handle error response
		callback(error, null)
		console.error(error, 'Unable to connect to cluster!')
		process.exit(1)
	}
}
module.exports = consumeFromQueue

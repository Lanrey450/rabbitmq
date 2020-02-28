const amqp = require('amqplib');
const config = require('../config');

const publishToQueue = async (queue, message) => {
    try {
    const cluster = await amqp.connect(`amqp://${config.rabbit_mq.user}:${config.rabbit_mq.pass}@${config.rabbit_mq.host}:${config.rabbit_mq.port}/${config.rabbit_mq.vhost}`);
    const channel = await cluster.createChannel();
    await channel.assertQueue(queue, { durable: true, noAck: false });
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    console.info(' [x] Sending message to queue', queue, message);

    await channel.close();

    } catch (error) {
        // handle error response
        console.error(error, 'Unable to connect to cluster!');  
        process.exit(1);
    }

}
module.exports = publishToQueue;
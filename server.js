/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */


/* eslint-disable no-tabs */
require('dotenv').config()
const soap = require('soap')
const express = require('express')
const bodyParser = require('body-parser')
const TerraLogger = require('terra-logger')
const cors = require('cors')
const session = require('express-session')
const fs = require('fs')
const querystring = require('query-string')


const RedisStore = require('connect-redis')(session)

const axios = require('axios')
const Redis = require('./redis')
const config = require('./config')
const publish = require('./rabbitmq/producer')


const { wsdl_path } = config

// const publish = require('./rabbitmq/producer')

const mtn_feedback_xml = fs.readFileSync(`${wsdl_path}/services.wsdl`, 'utf8')


const routes = require('./routes')

const redisClient = require('./redis')

require('./mongoClient')

require('./customHandler')

const app = express()


// const myService = {
// 	NotificationToCPService: {
// 	  NotificationToCP: {
// 		async notificationToCP(args) {
// 			TerraLogger.debug('Feedback from Airtel = ', args.notificationRespDTO)
// 			return publish(config.rabbit_mq.airtel.postback_queue, { ...args.notificationRespDTO, network: 'Airtel' })
// 				.then(() => {
// 					TerraLogger.debug(`pushed feedback data to queue: ${config.rabbit_mq.airtel.postback_queue}  `)
// 				})
// 		},
// 	  },
// 	},
//   }

//   const smsService = {
// 	SmsNotificationService: {
// 		SmsNotification: {
// 		async smsNotification(args) {
// 			console.log(args, '-------------SMS_XML_MTN')
// 			TerraLogger.debug('Feedback from MTN SMS API = ', args)
// 		},
// 	  },
// 	},
//   }


//   const ussdService = {
// 	UssdNotificationService: {
// 		UssdNotification: {
// 		async ussdNotification(args) {
// 			console.log(args, '-------------USSD_XML_MTN')
// 			TerraLogger.debug('Feedback from MTN USSD API = ', args)
// 		},
// 	  },
// 	},

//   }


app.use(
	session({
	  store: new RedisStore({ client: redisClient }),
	  secret: `${config.redisSecret}`,
	  resave: false,
	  saveUninitialized: false,
	})
  )
// Print redis errors to the console
redisClient.on('error', (error) => {
	TerraLogger.debug(`Redis Client Error => ${error}`)
})


app.use(cors())

app.use(TerraLogger.requestHandler)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


// parse application/json
app.use(bodyParser.json())


app.get('/', (req, res) => {
	// eslint-disable-next-line no-tabs
	res.status(200).send('Welcome to the Aggregator subscription and billing Engine')
})


// add routes here
routes(app)


const server = app.listen(config.port, () => {
	TerraLogger.debug(`${config.name} listening on port ${config.port}!`)
})


app.use(bodyParser.raw({
	type() {
	  return true
	},
  }))


function notifySmsReception(args, cb, headers) {
	console.log('notifySmsReception')
	console.log(args)
			const url = `${config.mtn.baseSmsOnboardUrl}/sms/entry?${querystring.stringify({
 sender: args.message.senderAddress, recipient: args.message.smsServiceActivationNumber, message: args.message.message, network: 'mtn', sub_source: 'sms'
})}`
			return axios.get(url).then((response) => {
				console.log(response.data)
			}).catch((err) => {
				console.log(err)
			})

    // return { result: '0' }
}


function notifyUssdReception(args, cb, headers) {
	console.log('notifyUssdReception')
	console.log(args, '-----')
	// console.log(headers, '-----')

	return axios.post(`${config.mtn.baseSmsOnboardUrl}/ussd/entry`, {
		serviceCode: args.serviceCode[0],
		command: args.ussdString[0],
		network: 'mtn',
		msisdn: args.msIsdn[0],
		sessionId: headers.NotifySOAPHeader.linkid,
		msgType: args.msgType[0],
	  })
	  .then((response) =>
		// console.log(response.data)
		// return response.data.result
		 ({ result: '0' }))
	  .catch((error) =>
		// console.log(error)
		 ({ result: '0' }))

	//   return { result: '0' }

	// return { result: '0' }
}


 // handle dlr from MTN - forward to the new url on notification_url_dlr
function notifySmsDeliveryReceipt(args, cb, headers) {
	console.log('notifySmsDeliveryReceipt')
	console.log(args, headers.NotifySOAPHeader, '------notifySmsDeliveryReceipt')

	const resp = {
		correlator: args.correlator[0],
		msisdn: args.deliveryStatus.address.substring[4],
		deliveryStatus: args.deliveryStatus.deliveryStatus,
		serviceId: headers.NotifySOAPHeader.serviceId,
		timeStamp: headers.NotifySOAPHeader.timeStamp,
		traceUniqueID: headers.NotifySOAPHeader.traceUniqueID,
		network: 'mtn'
	}


	return publish(config.rabbit_mq.mtn.send_sms_dlr_queue, { ...resp })
	.then((data) => {console.log(data, 'data for send sms pushed to queue')}).catch((error) => {console.log(error, 'error pushing send sms data to queue')})

	// const data = {
	// 	correlator: [ '00001' ],
	// 	deliveryStatus: {
	// 	  address: 'tel:8612312345678',
	// 	  deliveryStatus: 'DeliveredToTerminal'
	// 	}
	//   } {
	// 	spRevId: 'sdp',
	// 	spRevpassword: '206D88BB7F3D154B130DD6E1E0B8828B',
	// 	spId: '000201',
	// 	serviceId: '35000001000001',
	// 	timeStamp: '111029084631570',
	// 	traceUniqueID: '100001200101110623021721000011'
	//   }

	//   const resp = 

	// const redisKeyForDlrUrl = `DLR_URL::${headers.NotifySOAPHeader.serviceId}::${args.deliveryStatus.address.substring(4)}`

	// 	// console.log(redisKeyForDlrUrl)

	// 	return Redis.getAsync(redisKeyForDlrUrl)
	// 	.then((dlrUrl) => {
	// 		TerraLogger.debug(dlrUrl, 'dlrUrl from redis')
	// 	console.log(dlrUrl, 'dlr url')
	// 	return axios.get(dlrUrl).then((response) => {
	// 		console.log(response.data)
	// 	}).catch((err) => {
	// 		console.log(err)
	// 	})
	// 	}).catch((error) => {
	// 		TerraLogger.debug(error, 'Error getting dlrUrl from redis')
	// 	})
}


const serviceObject = {
	MTNSDPService: {
		NotifySmsReceptionServicePort: {
			notifySmsReception,
			notifyUssdReception,
			notifySmsDeliveryReceipt,
		},
	}
}


// MTN postback endpoints

const soapUrl_dlr = '/mtn/dlr'
TerraLogger.debug(`Listening for MTN DLR SOAP postback on: ${soapUrl_dlr}`)
const soapServerSub1 = soap.listen(server, soapUrl_dlr, serviceObject, mtn_feedback_xml)
soapServerSub1.log = (type, data) => {
	TerraLogger.debug(type, data)
}

const soapUrl_sms_mo = '/mtn/sms_mo'
TerraLogger.debug(`Listening for MTN SMS MO SOAP postback on: ${soapUrl_sms_mo}`)
const soapServerSub2 = soap.listen(server, soapUrl_sms_mo, serviceObject, mtn_feedback_xml)
soapServerSub2.log = (type, data) => {
	TerraLogger.debug(type, data)
}

const soapUrl_ussd_mo = '/mtn/ussd_mo'
TerraLogger.debug(`Listening for MTN USSD MO SOAP postback on: ${soapUrl_ussd_mo}`)
const soapServerSub3 = soap.listen(server, soapUrl_ussd_mo, serviceObject, mtn_feedback_xml)
soapServerSub3.log = (type, data) => {
	TerraLogger.debug(type, data)
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found')
	TerraLogger.debug(err)
	err.status = 404
	next(err)
})


module.exports = app

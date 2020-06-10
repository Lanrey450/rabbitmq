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

const RedisStore = require('connect-redis')(session)

const request = require('request')
const Utils = require('./lib/utils')
const config = require('./config')


const { wsdl_path } = config

const publish = require('./rabbitmq/producer')

const xml = fs.readFileSync(`${wsdl_path}/NotificationToCP.wsdl`, 'utf8')

const routes = require('./routes')

const redisClient = require('./redis')

require('./mongoClient')

require('./customHandler')

const app = express()


const myService = {
	NotificationToCPService: {
	  NotificationToCP: {
		async notificationToCP(args) {
			TerraLogger.debug('Feedback from Airtel = ', args.notificationRespDTO)
			return publish(config.rabbit_mq.airtel.postback_queue, { ...args.notificationRespDTO, network: 'Airtel' })
				.then(() => {
					TerraLogger.debug(`pushed feedback data to queue: ${config.rabbit_mq.airtel.postback_queue}  `)
				})
		},
	  },
	},
  }

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

//  sms notify endpoint
app.post('/smsNotify', (req, res) => {
	const sms_notify_xml = `
	<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<soapenv:Header>
<ns1:NotifySOAPHeader xmlns:ns1="http://www.huawei.com.cn/schema/common/v2_1">
<ns1:spRevId>sdp</ns1:spRevId> <ns1:spRevpassword>206D88BB7F3D154B130DD6E1E0B8828B</ns1:spRevpassword> <ns1:spId>000201</ns1:spId> <ns1:serviceId>35000001000001</ns1:serviceId> <ns1:timeStamp>111029084631570</ns1:timeStamp> <ns1:traceUniqueID>100001200101110623021721000011</ns1:traceUniqueID>
         </ns1:NotifySOAPHeader>
       </soapenv:Header>
       <soapenv:Body>
<ns2:notifySmsDeliveryReceipt xmlns:ns2="http://www.csapi.org/schema/parlayx/sms/notification/v2_2/local">
<ns2:correlator>00001</ns2:correlator> <ns2:deliveryStatus>
<address>tel:8612312345678</address>
<deliveryStatus>DeliveredToTerminal</deliveryStatus> </ns2:deliveryStatus>
         </ns2:notifySmsDeliveryReceipt>
       </soapenv:Body>
    </soapenv:Envelope>`

const options = {
  url: `${config.mtn.notifyUrl.sms}?wsdl`,
  method: 'POST',
  body: sms_notify_xml,
  headers: {
    'Content-Type': 'text/xml;charset=utf-8',
    'Accept-Encoding': 'gzip,deflate',
    'Content-Length': sms_notify_xml.length,
     SOAPAction: 'http://www.csapi.org/wsdl/parlayx/sms/notification/v2_2/service'
  }
}

const callback = (error, response, body) => {
  if (!error && response.statusCode === 200) {
    console.log('Raw result', body)
    const result = Utils.xmltoJSON(body)
	const {
 sender, recipient, message, network = 'mtn'
} = result
	// post to onboarding gateway endpoint
	// return request.get(`${config.mtn.baseSmsOnboardUrl}sender=${sender}&recipient=${recipient}&message=${message}&network=${network}&sub_source=sms}`, (err, resp, payload) => {
	// 	if (err) { console.log(err); return }
	// 	console.log(`Get response: ${resp.statusCode}`)
	//   })
  }
  console.log('error', response.statusCode, response.statusMessage, error)
}
request(options, callback)
})

//  ussd notify endpoint
app.post('/ussdNotify', (req, res) => {
	const ussd_notify_xml = `
	<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<soapenv:Header>
<ns1:NotifySOAPHeader xmlns:ns1="http://www.huawei.com.cn/schema/common/v2_1">
<ns1:spRevId>35000001</ns1:spRevId> <ns1:spRevpassword>206D88BB7F3D154B130DD6E1E0B8828B</ns1:spRevpassword> <ns1:spId>000201</ns1:spId> <ns1:serviceId>35000001000029</ns1:serviceId> <ns1:timeStamp>20100731064245</ns1:timeStamp> <ns1:linkid>12345678901111</ns1:linkid> <ns1:traceUniqueID>404092403801104031047140004003</ns1:traceUniqueID>
         </ns1:NotifySOAPHeader>
       </soapenv:Header>
       <soapenv:Body>
<ns2:notifyUssdReception xmlns:ns2="http://www.csapi.org/schema/parlayx/ussd/notification/v1_0/local">
<ns2:msgType>0</ns2:msgType> <ns2:senderCB>320207133</ns2:senderCB> <ns2:receiveCB>0xFFFFFFFF</ns2:receiveCB> <ns2:ussdOpType>1</ns2:ussdOpType> <ns2:msIsdn>8613699991234</ns2:msIsdn> <ns2:serviceCode>2929</ns2:serviceCode> <ns2:codeScheme>17</ns2:codeScheme>
<ns2:ussdString>*10086*01#</ns2:ussdString> <ns2:extenionInfo>
             <item>
                <key></key>
                <value></value>
             </item>
            </ns2:extensionInfo>
         </ns2:notifyUssdReception>
       </soapenv:Body>
    </soapenv:Envelope>`

const options = {
  url: `${config.mtn.notifyUrl.ussd}?wsdl`,
  method: 'POST',
  body: ussd_notify_xml,
  headers: {
    'Content-Type': 'text/xml;charset=utf-8',
    'Accept-Encoding': 'gzip,deflate',
    'Content-Length': ussd_notify_xml.length,
     SOAPAction: 'http://www.csapi.org/wsdl/parlayx/ussd/notification/v2_2/service'
  }
}

const callback = (error, response, body) => {
	if (!error && response.statusCode === 200) {
	  console.log('Raw result', body)
	  const result = Utils.xmltoJSON(body)
	  const {
   sender, recipient, message, network = 'mtn'
  } = result
	  // post to onboarding gateway endpoint
	  // return request.get(`${config.mtn.baseSmsOnboardUrl}sender=${sender}&recipient=${recipient}&message=${message}&network=${network}&sub_source=sms}`, (err, resp, payload) => {
	  // 	if (err) { console.log(err); return }
	  // 	console.log(`Get response: ${resp.statusCode}`)
	  //   })
	}
	console.log('error', response.statusCode, response.statusMessage, error)
  }
  request(options, callback)
  })

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found')
	TerraLogger.debug(err)
	err.status = 404
	next(err)
})

const server = app.listen(config.port, () => {
	TerraLogger.debug(`${config.name} listening on port ${config.port}!`)
})


app.use(bodyParser.raw({
	type() {
	  return true
	},
  }))


// Airtel subscription postback endpoint
const soapUrl = '/airtelPostback'
TerraLogger.debug(`Listening for Airtel SOAP postback on: ${soapUrl}`)
const soapServerSub = soap.listen(server, soapUrl, myService, xml)
soapServerSub.log = (type, data) => {
TerraLogger.debug(type, data)
}

module.exports = app

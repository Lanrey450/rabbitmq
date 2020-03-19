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

const config = require('./config')

const { wsdl_path } = config

const xml = fs.readFileSync(`${wsdl_path}/NotificationToCP.wsdl`, 'utf8')
const routes = require('./routes')

const redisClient = require('./redis')
const AirtelService = require('./lib/airtel/subscription')
require('./mongoClient')

require('./customHandler')

const app = express()


const myService = {
	NotificationToCPService: {
	  NotificationToCP: {
		async notificationToCP(args, cb) {
		  console.log('notificationToCP', args)
		  await AirtelService.pushAirtelFeedbackToQueue(args)
		  cb({})
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

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
// 	const err = new Error('Not Found')
// 	TerraLogger.debug(err)
// 	err.status = 404
// 	next(err)
// })

app.listen(config.port, () => {
	TerraLogger.debug(`${config.name} listening on port ${config.port}!`)
	// Airtel postback endpoint(INCOMING FROM TELCO)
	const soapUrl = '/airtelPostback'
	console.log(`Airtel SOAP postback endpoint is : ${soapUrl}`)
	const soapServer = soap.listen(app, soapUrl, myService, xml)
	soapServer.log = function soapLog(type, data) {
	  console.log(type, data)
	}
})

module.exports = app

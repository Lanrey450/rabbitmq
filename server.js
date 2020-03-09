/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const TerraLogger = require('terra-logger')


const cors = require('cors')


const session = require('express-session')

const RedisStore = require('connect-redis')(session)

const redisClient = require('./redis')


const routes = require('./routes')

const app = express()


const config = require('./config')

require('./mongoClient')

app.use(TerraLogger.requestHandler)

app.use(cors)


app.use(
	session({
	  store: new RedisStore({ client: redisClient }),
	  secret: `${config.redisSecret}`,
	  resave: false,
	  saveUninitialized: false,
	})
  )

// Print redis errors to the console
redisClient.on('error', (err) => {
	console.log(`Redis Client Error ${err}`)
})


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


app.listen(config.port, () => {
	console.log(`${config.name} listening on port ${config.port}!`)
})

module.exports = app

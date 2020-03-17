/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable space-in-parens */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable quotes */
/* eslint-disable-next-line no-unused-vars */
/* eslint-disable no-tabs */
const mongoose = require('mongoose')
const TerraLogger = require('terra-logger')
const debug = require('debug')('mongodb')
const config = require('./config')


const defaultConfig = {
	// eslint-disable-next-line no-tabs
	username: config.databases.mongodb.user,
	password: config.databases.mongodb.password,
	host: config.databases.mongodb.host,
	port: config.databases.mongodb.port,
	db_name: config.databases.mongodb.db_name,
	url: config.databases.mongodb.url,
}


// switch when deploying for production envs
const defaultUrl = `mongodb://${defaultConfig.username}:${defaultConfig.password}@${defaultConfig.host}:${defaultConfig.port}/${defaultConfig.db_name}?retryWrites=true`

//  local dev
// const defaultUrl = defaultConfig.url

mongoose.set('debug', true)

TerraLogger.debug("MONGO_DB_FULL_URL", defaultUrl)

mongoose.connect(defaultUrl, { useNewUrlParser: true, useCreateIndex: true }).catch( (err) => TerraLogger.debug(err)) 
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on("connected", () => {
	TerraLogger.debug("mongodb connected")
})
db.on('error', (error) => {
	TerraLogger.debug("An error occurred", JSON.stringify(error))
	TerraLogger.debug(error.message, new Error(error.message), { defaultUrl }, true)
	process.exit(0)
})

global.db = db
process.on('SIGINT', function () {
	mongoose.connection.close(function () {
		TerraLogger.debug('Mongoose disconnected on app termination')
		process.exit(0)
	})
})

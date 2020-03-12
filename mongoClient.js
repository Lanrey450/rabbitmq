/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable space-in-parens */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable quotes */
/* eslint-disable-next-line no-unused-vars */
/* eslint-disable no-tabs */
const mongoose = require('mongoose')
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
// const defaultUrl = `mongodb://${defaultConfig.username}:${defaultConfig.password}@${defaultConfig.host}:${defaultConfig.port}/${defaultConfig.db_name}?retryWrites=true`

// for local
const defaultUrl = defaultConfig.url

mongoose.set('debug', true)

console.log("MONGO_DB_FULL_URL", defaultUrl)

mongoose.connect(defaultUrl, { useNewUrlParser: true, useCreateIndex: true }).catch( (err) => console.log(err)) 
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on("connected", () => {
	console.log("mongodb connected")
})
db.on('error', (error) => {
	console.error("An error occurred", JSON.stringify(error))
	console.log(error.message, new Error(error.message), { defaultUrl }, true)
	process.exit(0)
})

global.db = db
process.on('SIGINT', function () {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected on app termination')
		process.exit(0)
	})
})

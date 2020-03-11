/* eslint-disable arrow-parens */
/* eslint-disable no-tabs */
/* eslint-disable space-in-parens */
// eslint-disable-next-line no-unused-vars
const config = require('../../config')
// const ResponseManager = require('../../commons/response')
// const publish = require('../../rabbitmq/producer')

module.exports = ( app => {
	app.post('/mo/', (req, res) => {
		console.log('mo request')
		console.log(req.body)
		res.send('ok')
	})

	app.post('/mt/dn/', (req, res) => {
		console.log('mt request')
		console.log(req.body)
		res.send('ok')
	})

	app.post('/optin/', (req, res) => {
		console.log('optin request')
		console.log(req.body)
		res.send('ok')
	})

	app.post('/optout/', (req, res) => {
		console.log('optout request')
		console.log(req.body)
		res.send('ok')
	})

	app.post('/user-renewed/', (req, res) => {
		console.log('user-renewed request')
		console.log(req.body)
		res.send('ok')
	})

	app.post('/charge/dob/', (req, res) => {
		console.log('user-renewed request')
		console.log(req.body)
		res.send('ok')
	})

	app.post('/charge/async/', (req, res) => {
		console.log('charge async request')
		console.log(req.body)
		res.send('ok')
	})
	app.post('/consent/', (req, res) => {
		console.log('consent request')
		console.log(req.body)
		res.send('ok')
	})
})

/* eslint-disable func-call-spacing */
/* eslint-disable no-spaced-func */
/* eslint-disable no-tabs */

const axios = require('axios')
const TerraLogger = require('terra-logger')
const redis = require('./redis')
const config = require('./config')


const INTERNAL_SECURITY_TOKEN = config.internalSecurityToken;


(async () => {
	const secKey = await redis.getAsync(INTERNAL_SECURITY_TOKEN)
	TerraLogger.debug('security key', secKey)
	axios.defaults.headers.common['internal-security-token'] = secKey
	global.alphaToken = secKey
	return secKey
})().catch(console.log)
	.then(console.log)

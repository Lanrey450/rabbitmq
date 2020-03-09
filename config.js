/* eslint-disable no-tabs */
require('dotenv').config()

const { env } = process

module.exports = {
	name: env.APP_NAME,
	port: env.PORT,
	nineMobile: {
		partnerRoleId: env.NINE_MOBILE_PARTNER_ROLE_ID,
		preSharedKey: env.NINE_MOBILE_PRESHARED_KEY,
		apiSubscriptionKey: env.NINE_MOBILE_SUBSCRIPTION_KEY,
		username: env.NINE_MOBILE_AGGREGATOR_USERNAME,
		password: env.NINE_MOBILE_AGGREGATOR_PASSWORD,
		aggregatorId: env.NINE_MOBILE_AGGREGATOR_ID,
		baseUrl: env.NINE_MOBILE_AGGREGATOR_BASEURL,
	},
	mtn: {
		spID: env.MTN_SPID,
		spPwd: env.MTN_SPPWD,
		username: env.MTN_USERNAME,
	},
	airtel: {
		cpID: env.AIRTEL_CPID,
		cpName: env.AIRTEL_CPNAME,
		cpPassword: env.AIRTEL_CP_PASSWORD,

	},
	userAuth: {
		username: env.PARTNER_USERNAME,
		password: env.PARTNER_PASSWORD,

	},
	databases: {
		mongodb: {
			user: env.MONGODB_USER,
			password: env.MONGODB_PASSWORD,
			host: env.MONGODB_HOST,
			port: env.MONGODB_PORT,
			db: env.MONGODB_USERNAME,
			url: env.MONGODB_URL,
		},
	},
	rabbit_mq: {
		host: process.env.RABBITMQ_HOST,
		port: process.env.RABBITMQ_PORT,
		user: process.env.RABBITMQ_USER,
		pass: process.env.RABBITMQ_PASS,
		vhost: process.env.RABBITMQ_VHOST,
		airtel_log_queue: env.AIRTEL_SE_LOG_QUEUE_NAME,
		mtn: {
			subscription_queue: process.env.MTN_SUBSCRIPTION_QUEUE || 'MTN',
			un_subscription_queue: process.env.MTN_UNSUBSCRIPTION_QUEUE || 'MTN',
			postback_queue: process.env.MTN_POSTBACK_QUEUE || 'MTN'
		},
		airtel: {

		}
	},
	airtel_options: {
		host: env.AIRTEL_SE_AIRTEL_HOST,
		port: env.AIRTEL_SE_AIRTEL_PORT,
		timeout: env.AIRTEL_SE_CLIENT_TIMEOUT,
		endpoints: {
			subscription: 'http://51.141.239.120:8090/SchedulingEngineWeb/services/CallSubscription',
		},
		soap_xml: {
			subscription: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sub="http://SubscriptionEngine.ibm.com"> <soapenv:Header/><soapenv:Body><sub:handleNewSubscription><custAttributesDTO><msisdn>[msisdn]</msisdn><cpId>[cp_id]</cpId><cpName>[cp_name]</cpName><cpPwd>[cp_password]</cpPwd><channelName>[channel_name]</channelName><productId>[product_id]</productId><aocMsg1>8</aocMsg1><aocMsg2>9</aocMsg2><firstConfirmationDTTM>[firstConfirmationDTTM]</firstConfirmationDTTM></custAttributesDTO></sub:handleNewSubscription></soapenv:Body></soapenv:Envelope>',
			un_subscription: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sub="http://SubscriptionEngine.ibm.com"><soapenv:Header/><soapenv:Body><sub:handleDeSubscription><custAttributesDTO><msisdn>[msisdn]</msisdn><productId>[product_id]</productId><cpId>[cp_id]</cpId><cpPwd>[cp_password]</cpPwd></custAttributesDTO></sub:handleDeSubscription></soapenv:Body></soapenv:Envelope>',
			notification_response: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Header/><soapenv:Body><p475:getNotificationStatusResponse xmlns:p475="http://TerragonAirtelSEApplication.terragonbase.com"><getNotificationStatusResponseReturn><cpId>[cp_id]</cpId><cpName>[cp_name]</cpName><channelName>[channel_name]</channelName><notificationTime>[notification_time]</notificationTime><errorCode>[error_code]</errorCode><errorStatus>[error_status]</errorStatus><errorMsg>[error_msg]</errorMsg></getNotificationStatusResponseReturn></p475:getNotificationStatusResponse></soapenv:Body></soapenv:Envelope>',
		},
		allowed_channels: ['SMS', 'WEB', 'USSD', 'IVR', 'MAMO', 'WAP', 'OBD'],
	},
	wsdl_path: env.AIRTEL_SE_CLIENT_WSDL_PATH,
	se_soap_wsdl_files: {
		CallSubscription: 'CallSubscription.wsdl',
		HTSubscriptionServices: 'HTSubscriptionServices.wsdl',
		TopUpService: 'TopUpService.wsdl',
	},
	blacklist_base_url: env.AIRTEL_SE_CLIENT_BLACKLIST_BASE_URL,
	user_status: {
		new: 'new',
		active: 'active',
		inactive: 'inactive',
		renew: 'renew',
		suspended: 'suspended',
	},
	airtel_request_type: {
		sub: 'sub',
		unsub: 'unsub',
		renew: 'renew',
	},
}

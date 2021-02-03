/* eslint-disable no-tabs */
require('dotenv').config()

const { env } = process

module.exports = {
	name: env.APP_NAME,
	port: env.PORT,
	nineMobile: {
		apiSubscriptionKey: env.NINE_MOBILE_SUBSCRIPTION_KEY,
		username: env.NINE_MOBILE_AGGREGATOR_USERNAME,
		authorization: env.NINE_MOBILE_AGGREGATOR_PASSWORD,
		baseUrl: env.NINE_MOBILE_AGGREGATOR_BASEURL,
		aggregatorId: env.NINE_MOBILE_AGGREGATOR_ID,
	},

	feedbackQueues: {
		SubscriptionFeedbackQUEUE: 'subscription_feedback', // MTN and Airtel data tracking and gathering
		BillingFeedbackQUEUE: 'charge_feedback', // charge_feedback from airtel and mtn subscription-postback-queue
		UnsubscriptionFeedbackQUEUE: 'unsubscription_feedback', // unsubscription queue from TG
	},

	mtn: {
		spID: env.MTN_SPID,
		spPwd: env.MTN_SPPWD,
		baseSmsOnboardUrl: env.SMS_USSD_IVR_ONBOARDING_SERVICE_URL,
		notifyUrl: {
			sms: `${env.APP_BASE_URL}/mtn/sms_mo`,
			ussd: `${env.APP_BASE_URL}/mtn/ussd_mo`,
			sms_dlr: `${env.APP_BASE_URL}/mtn/dlr`,
			notification_url_dlr: env.SMS_NOTIFICATION_STATUS_URL,
		},
	},
	airtel: {
		cpID: env.AIRTEL_CP_ID,
		cpPassword: env.AIRTEL_CP_PASSWORD,
		cpName: env.AIRTEL_CP_NAME,

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
			db_name: env.MONGODB_DATABASE_NAME,
			url: env.MONGODB_LOCAL_URL,
		},
	},
	redisClientConnection: {
		host: env.REDIS_HOST,
		password: env.REDIS_PASSWORD,
		port: env.REDIS_PORT,

	},
	rabbit_mq: {
		host: env.RABBITMQ_HOST,
		port: env.RABBITMQ_PORT,
		user: env.RABBITMQ_USER,
		pass: env.RABBITMQ_PASSWORD,
		vhost: env.RABBITMQ_VHOST,
		mtn: {
			subscription_queue: 'mtn_subscription_queue', // our inhouse TG data tracking and gathering 
			un_subscription_queue: 'mtn_unsubscription_queue',  // aggregator platform queue
			subscription_postback_queue: 'mtn_postback_queue',  // aggregator platform queue
			send_sms_queue: 'mtn_send_sms_queue',
			send_sms_dlr_queue: 'send_sms_dlr_queue',
			authorize_payment_queue: 'authorize_payment_queue',
			charge_token_queue: 'charge_token_queue',
		},
		airtel: {
			subscription_queue: 'airtel_subscription_queue',   // our inhouse TG data tracking and gathering
			un_subscription_queue: 'airtel_unsubscription_queue',  // aggregator platform queue
			subscription_postback_queue: 'airtel_postback_queue', // aggregator platform queue
		},
		nineMobile: {
			subscription_queue: '9Mobile_subscription_queue',
			charge_postback_queue: '9Mobile_charge_queue',
			un_subscription_queue: '9Mobile_unsubscription_queue',
		},

		vasQueues: {
	
			SUBSCRIPTION_AND_CHARGE_FALLBACK: "subscription_and_charge_fallback",

		},
	},
	airtel_options: {
		host: env.AIRTEL_SE_AIRTEL_HOST,
		port: env.AIRTEL_SE_AIRTEL_PORT,
		endpoints: {
			subscription: env.AIRTEL_SE_SUBSCRIPTION_BASE_URL,
		},
		soap_xml: {
			subscription: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sub="http://SubscriptionEngine.ibm.com"> <soapenv:Header/><soapenv:Body><sub:handleNewSubscription><custAttributesDTO><msisdn>[msisdn]</msisdn><cpId>[cp_id]</cpId><cpName>[cp_name]</cpName><cpPwd>[cp_password]</cpPwd><channelName>[channel_name]</channelName><productId>[product_id]</productId><aocMsg1>8</aocMsg1><aocMsg2>9</aocMsg2><firstConfirmationDTTM>[firstConfirmationDTTM]</firstConfirmationDTTM></custAttributesDTO></sub:handleNewSubscription></soapenv:Body></soapenv:Envelope>',
			un_subscription: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sub="http://SubscriptionEngine.ibm.com"><soapenv:Header/><soapenv:Body><sub:handleDeSubscription><custAttributesDTO><msisdn>[msisdn]</msisdn><productId>[product_id]</productId><cpId>[cp_id]</cpId><cpPwd>[cp_password]</cpPwd></custAttributesDTO></sub:handleDeSubscription></soapenv:Body></soapenv:Envelope>',
			notification_response: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Header/><soapenv:Body><p475:getNotificationStatusResponse xmlns:p475="http://TerragonAirtelSEApplication.terragonbase.com"><getNotificationStatusResponseReturn><cpId>[cp_id]</cpId><cpName>[cp_name]</cpName><channelName>[channel_name]</channelName><notificationTime>[notification_time]</notificationTime><errorCode>[error_code]</errorCode><errorStatus>[error_status]</errorStatus><errorMsg>[error_msg]</errorMsg></getNotificationStatusResponseReturn></p475:getNotificationStatusResponse></soapenv:Body></soapenv:Envelope>',
		},
		allowed_channels: ['SMS', 'WEB', 'USSD', 'IVR', 'MAMO', 'WAP', 'OBD'],
	},
	se_soap_wsdl_files: {
		CallSubscription: 'CallSubscription.wsdl',
		HTSubscriptionServices: 'HTSubscriptionServices.wsdl',
		TopUpService: 'TopUpService.wsdl',
	},
	notification_service_url: env.NOTIFICATION_SERVICE_URL,
	redisSecret: env.REDIS_SECRET,
	user_status: {
		new: 'new',
		active: 'active',
		inactive: 'inactive',
		renew: 'renew',
		suspended: 'suspended',
	},
	internalSecurityToken: env.INTERNAL_SECURITY_TOKEN,
	baseURL: `${env.APP_BASE_URL}/subscription`,
	wsdl_path: env.WSDL_PATH,
	request_type: {
		sub: 'subscription',
		unsub: 'unsubscription',
		renew: 'renew',
	},
}

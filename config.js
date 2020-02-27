require('dotenv').config();

const env = process.env;

module.exports = {
  name: env.APP_NAME,
  port: env.PORT,
  nineMobile:{
    partnerRoleId: env.NINE_MOBILE_PARTNER_ROLE_ID,
    preSharedKey: env.NINE_MOBILE_PRESHARED_KEY,
    apiSubscriptionKey: env.NINE_MOBILE_SUBSCRIPTION_KEY,
    username:env.NINE_MOBILE_AGGREGATOR_USERNAME,
    password:env.NINE_MOBILE_AGGREGATOR_PASSWORD,
    aggregatorId: env.NINE_MOBILE_AGGREGATOR_ID,
    baseUrl: env.NINE_MOBILE_AGGREGATOR_BASEURL
  },
  mtn: {

  }, 

  airtel: {

  },
  databases: {
    mongodb:{
      user: env.MONGODB_USER,
      password: env.MONGODB_PASSWORD,
      host: env.MONGODB_HOST,
      port: env.MONGODB_PORT,
      db: env.MONGODB_USERNAME,
    }
  }
};
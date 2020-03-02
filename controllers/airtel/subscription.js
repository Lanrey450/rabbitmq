const SubscriptionService = require('../../lib/airtel/subscription');
const config = require('../../config');
const Axios = require('axios');
const ResponseManager = require('../../commons/response');
const Utils = require('../../lib/utils');

module.exports = {

/**
     * This subscribes a user to a service on Airtel SE.
     * It also logs the subscription request into MongoDB (via RabbitMQ)
     *
     * @param req
     * @param res
     * @methodVerb POST
     */
    subscribeRequest(req, res) {
        const { msisdn, serviceObject, channel } = req.body;
        if (!(msisdn || serviceObject || channel )) {  
          return ResponseManager.sendErrorResponse({res, message:'Please pass all required parameters!', statusCode})
        }

        if (!config.airtel_options.allowed_channels.includes(channel.toUpperCase())) {
            return ResponseManager.sendErrorResponse({res, message:'unavailable channel at this time!', statusCode})
        }
        return this.subscribeUser(channel, msisdn, serviceObject)
          .then((response) => {
            console.log(`response ${JSON.stringify(response)}`);
            if (response.error) {
                return ResponseManager.sendErrorResponse({res, message: response.message,responseBody: response.data, statusCode})
            }
            return ResponseManager.sendResponse({res, responseBody: response.data});
          }).catch((error) => {
            console.log(error);
            return ResponseManager.sendErrorResponse(res, { message: error.message }, error.statusCode);
          });
      },
    
      /**
       * This is a method use to subcribe user
       * @param channel
       * @param msisdn this is the mobile number of user to be subscribed
       * @param serviceObject this is the service config to be subscribed against
       */
      subscribeUser(channel, msisdn, serviceObject) {
        const response = {};
        console.log(`Checking for ${msisdn} in Blacklist`);
          // Check if MSISDN is blacklisted
        return SubscriptionService.isInBlacklist(msisdn)
          .then((blacklistResponse) => {
          console.log(`Blacklist response for ${msisdn}: ${JSON.stringify(blacklistResponse)}`);
         if (!blacklistResponse.error && !blacklistResponse.data) {
        // If subscription was successful, save in subscription collection and return success...
        return SubscriptionService.sendSubscriptionRequest(msisdn, channel, serviceObject, 'API')
          .then((subscriptionData) => {
            console.log(subscriptionData, 'subscription data :)');
            response.error = false;
            response.data = subscriptionData;
            return response;
          }).catch((error) => {
          console.log(`message: ${error.message}`);
          response.error = true;
          response.data = error.response;
          response.statusCode = error.statusCode;
          response.message = error.message;
          return response;
          })
          }
        }).catch((blackListError) => {
          console.log(`Error attempting to check blacklist status for MSISDN = ${msisdn}`);
          response.error = true;
          response.message = `Error attempting to check blacklist status for MSISDN = ${msisdn}`;
          response.data = blackListError;
          response.statusCode = blackListError.statusCode;
          return response;
        });
      },
    
    
     
      /**
         * Unsubscribe a user from Airtel's SE.
         * It also logs the unsubscription request into MongoDB (via RabbitMQ)...
         *
         * @param req
         * @param res
         * @methodVerb POST
         */
      unSubscribeRequest(req, res) {
        const { msisdn, serviceObject, channel  } = req.body;
        if (!(msisdn || serviceObject || channel )) {
          return ResponseManager.sendErrorResponse(res, { message: 'Please pass all required params!' });
        }
        console.log(`Making a unsubscription request for ${msisdn}`);
        // If un-subscription was successful, update the status field of the record in
        // subscription collection and return success...
        return this.unSubscribeUser(msisdn, serviceObject, channel)
          .then((response) => {
            console.info(`response ${response}`);
            if (response.error) {
              ResponseManager.sendErrorResponse(res, {
                response: response.data,
                message: response.message,
              }, response.statusCode);
            } else {
              ResponseManager.sendResponse({res, responseBody: response.data});
            }
          }).catch((error) => {
            console.info(error);
            return ResponseManager.sendErrorResponse(res, { message: error.message }, error.statusCode);
          });
      },
    
    
      /**
       * This is a method use to unsubcribe user from the queue
       * @param msisdn this is the mobile number of user to be unsubcribed from a service
       * @param serviceObject this is the serviceObject 
       */
      unSubscribeUser(msisdn, serviceObject, channel) {
        const response = {};
        console.info(`Making a unsubscription request for ${msisdn}`);
        // If un-subscription was successful, update the status field of the record in
        // subscription collection and return success...
         return SubscriptionService.sendUnSubscriptionRequest(msisdn, serviceObject, channel, 'API')
          .then((unsubscriptionData) => {
                console.info(`message: ${unsubscriptionData}`);
                response.error = false;
                response.data = unsubscriptionData;
                return response;
              })
          .catch((error) => {
            console.error(`Error attempting to unsubscribe user msisdn - ${msisdn}`, error);
            response.error = true;
            response.data = error;
            response.statusCode = error.statusCode;
            response.message = error.message || `Error attempting to unsubscribe user msisdn - ${msisdn}`;
            return response;
          });
      },
    

     // get status of service subscription
  getSubscriptionStatus(req, res) {
    const { msisdn, serviceId } = req.query;

    if (msisdn && serviceId) {
      const subscriptionDetails = await SubscriptionService.getSubscriptionStatus({msisdn, serviceId});

      if (subscriptionDetails) {
        return ResponseManager.sendResponse({
          res,
          message: 'Subscription status successfully fetched',
          data: subscriptionDetails,
        });
      }
      return ResponseManager.sendErrorResponse({
        res,
        message: 'The subscriber does not exist(invalid status)!',
        data: '',
      });
    }
    return  ResponseManager.sendErrorResponse({
      res,
      message: 'Please provide both msisdn and serviceId!',
    });
  },


  async airtelDataSyncPostBack(req, res) {

    console.log('getting data sync feedback from airtel');

    const data = req.body;

    console.log(data);


  },

    
};
const SubscriptionService = require('../../lib/airtel/subscription');
const config = require('../../config');
const Axios = require('axios');
const moment = require('moment');
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
          })
        .catch((error) => {
          console.log(`message: ${error.message}`);
          response.error = true;
          response.data = error.response;
          response.statusCode = error.statusCode;
          response.message = error.message;
          return response;
        });
    }
        })
        .catch((blackListError) => {
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
        const { msisdn, serviceObject } = req.body;
        if (!msisdn && !serviceObject) {
          return ResponseManager.sendErrorResponse(res, { message: 'Please pass user MSISDN!' });
        }

        console.log(`Making a unsubscription request for ${msisdn}`);
        // use service information to make  call to Airtel
        // If un-subscription was successful, update the status field of the record in
        // subscription collection and return success...
        return this.unSubscribeUser(msisdn, serviceObject)
          .then((response) => {
            console.info(`response ${response}`);
            if (response.error) {
              ResponseManager.sendErrorResponse(res, {
                response: response.data,
                message: response.message,
              }, response.statusCode);
            } else {
              ResponseManager.sendResponse(res, `${response.data}`);
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
      unSubscribeUser(msisdn, serviceObject) {
        const response = {};
        console.info(`Making a unsubscription request for ${msisdn}`);

        // If un-subscription was successful, update the status field of the record in
        // subscription collection and return success...
        return SubscriptionService.sendUnSubscriptionRequest(msisdn, serviceObject, 'API')
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
    
      /**
         * Save subscription data into subscription database
         * @param {*} subscriptionParameters
         */
      consumeSubscription(subscriptionParameters) {
        const subscriptionData = subscriptionParameters;
        const { msisdn, serviceObject } = subscriptionData;
        if (!msisdn || !serviceObject) {
          throw new Error(`Invalid subscription data to consume: ${JSON.stringify(subscriptionData)}`);
        }
        return SubscriptionService.putUserSubscription(subscriptionData)
          .then(savedSubscription => savedSubscription);
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




  /**
   * Notify Subscription Owner
   * @param {Object} service Service object
   * @param {Object} subscriptionData Subscription Data object
   */
    notifySubscriptionOwner(service, subscriptionData) {
    const { feedbackURL } = service;
    if (!feedbackURL) {
      throw new Error(`No feedbackURL for service: ${JSON.stringify(service)}`);
    }
    return Axios({
        method: 'post',
        url: `${feedbackURL}`,
        data: `${subscriptionData}`,
        timeout: 5000, // 5 seconds
        json: true,
        headers = {},
        responseType: 'json',
      }).then((response)=>{
        console.log(response);
        return response;
      }).catch((error)=>{
          console.log(error);
      })

  },


  /**
   * Process Feedback from Airel SE
   * @param {Object} feedbackParameters
   */
  processAirtelSEFeedback(feedbackParameters) {
    const {amount, errorCode, msisdn, productId, temp3, xactionId, chargigTime, serviceObject} = feedbackParameters;

        const subscriptionDetailsObject = Utils.xmltoJSON(temp3);
        console.info(`Subscription Details for ${msisdn} is: ${JSON.stringify(subscriptionDetailsObject)}`);

        const product = JSON.parse(serviceObject.product);

        let chargingTime = moment().toISOString();
        if (chargigTime && chargigTime != null) {
          chargingTime = new Date(chargigTime).toISOString();
        }
        const subscriptionData = {
          msisdn,
          productId: product.productId,
          amount: parseFloat(amount),
          type: subscriptionDetailsObject.XML.ChargingType,
          chargingTime,
          response: JSON.stringify(feedbackParameters),
          duration: product.duration,
          transactionId: xactionId,
          route: 'Airtel_SE_postback'
        };

        switch (errorCode) {
          case 1000: {
            subscriptionData.status = config.user_status.active;
            break;
          }
          case 1001: {
            subscriptionData.status = config.user_status.inactive;
            break;
          }
          case 1013: {
            subscriptionData.status = config.user_status.inactive;
            break;
          }
          case 3027: {
            // Set status to suspended because customer moved to grace and/or suspension
            subscriptionData.status = config.user_status.suspended;
            break;
          }
          default: {
            throw new Error(`Unknown subscription code: ${JSON.stringify(feedbackParameters)}`);
          }
        }

        if (subscriptionData.status === config.user_status.active && subscriptionData.type === 'R') {
          subscriptionData.status = config.user_status.renew;
        }

        if (service.feedbackURL) {
          return this.notifySubscriptionOwner(serviceObject, subscriptionData)
            .then((ownerNotificationResponse) => {
              console.info(`Notifcation to Owner response: ${JSON.stringify(ownerNotificationResponse)}`);
              return SubscriptionService.publishToSubscriptionLogQueue(subscriptionData)
                .then((status) => {
                  console.info(`Successfully pushed to the Airtel subscription data queue: ${status}`);
                  return status;
                })
                .catch((error) => {
                // error occurred while pushing to queue
                  console.error(`Could not push Airtel subscription to queue to be saved later in MongoDB: ${error}`);
                  console.error(`Data not pushed : ${JSON.stringify(subscriptionData)}`);
                  throw new Error(`Subscription data not pushed for logging: ${error}`);
                });
            })
            .catch((ownerNotificationError) => {
              console.error(`Error Posting back: ${ownerNotificationError}`);
              return SubscriptionService.publishToSubscriptionLogQueue(subscriptionData)
                .then((status) => {
                  console.info(`Successfully pushed to the Airtel subscription data queue: ${status}`);
                  return status;
                })
                .catch((error) => {
                // error occurred while pushing to queue
                  console.error(`Could not push Airtel subscription to queue to be saved later in MongoDB: ${error}`);
                  console.error(`Data not pushed : ${JSON.stringify(subscriptionData)}`);
                  throw new Error(`Subscription data not pushed for logging: ${error}`);
                });
            });
        }
        return SubscriptionService.publishToSubscriptionLogQueue(subscriptionData)
          .then((status) => {
            console.info(`Successfully pushed to the Airtel subscription data queue: ${status}`);
            return status;
          })
          .catch((error) => {
            // error occurred while pushing to queue
            console.error(`Could not push Airtel subscription to queue to be saved later in MongoDB: ${error}`);
            console.error(`Data not pushed : ${JSON.stringify(subscriptionData)}`);
            throw new Error(`Subscription data not pushed for logging: ${error}`);
          });
  },


  
  /**
     * Process Requests consumed from the SMS Requests queue
     * @param {Object} requestParameters
     */
    processSMSRequest(requestParameters) {
        const {msisdn, shortcode, message, route, service } = requestParameters;

        const cleanMessage = Utils.keywordSanitizer(message);
            if (service.optInKeywords.indexOf(cleanMessage) > -1 && service.shortCode === shortcode) {
              return SubscriptionService.sendSubscriptionRequest(msisdn, service, route)
                .then(subscriptionData =>
                  this.notifySubscriptionOwner(service, subscriptionData)
                    .then((apiResponse) => {
                      console.info(`Subscription Feedback posting to ${service.name} response: ${JSON.stringify(apiResponse)}`);
                      return subscriptionData;
                    })
                    .catch((apiError) => {
                      console.error(`Subscription Feedback posting to ${service.name} error: ${apiError}`);
                      return subscriptionData;
                    }))
                .catch((error) => {
                  console.error(`Error occurred while subscribing ${msisdn} to service with service key = ${cleanMessage}`, error);
                  throw new Error(error);
                });
            } else if (service.optOutKeywords.indexOf(cleanMessage) > -1 && service.shortCode === shortcode) {
              return SubscriptionService.sendUnSubscriptionRequest(msisdn, service, route)
                .then(unSubscriptionData =>
                  this.notifySubscriptionOwner(service, unSubscriptionData)
                    .then((apiResponse) => {
                      console.info(`Unsubscription Feedback posting to ${service.name} response: ${JSON.stringify(apiResponse)}`);
                      return unSubscriptionData;
                    })
                    .catch((apiError) => {
                      console.error(`Unsubscription Feedback posting to ${service.name} error: ${apiError}`);
                      return unSubscriptionData;
                    }))
                .catch((error) => {
                  console.error(`Error occurred while unsubscribing ${msisdn} from service with service key = ${cleanMessage}`, error);
                  throw new Error(error);
                });
            }
            throw new Error(`Invalid Service Key: ${message} : ${cleanMessage} on ${shortcode} is neither an opt-in or opt-out keyword for ${service.name} service on ${service.shortCode}`);
      },

   
};
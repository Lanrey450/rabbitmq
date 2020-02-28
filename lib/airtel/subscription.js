
const Axios = require('axios');
const config = require('../../config');
const Utils = require('../utils');
const moment = require('moment');



module.exports = {
  /**
     * Send a subscription request using Axios to the Airtel's SE
     *
     * @param msisdn Phone number to subscribe
     * @param channel channel to subscribe
     * @param service Service object
     * @param route Source of subscription request
     *  @returns {Promise}
     */
  sendSubscriptionRequest(msisdn, channel, service, route) {
    console.log(msisdn, channel, service);
    return new Promise((resolve, reject) => {
      const errorPayload = {
        error: true,
        msg: 'Empty Response: Airtel SE returned an empty response while subscribing user',
      };

      const validateService = Utils.validateServiceInfo(service);

      // no service data was passed...
      if (!service || validateService.error) {
        errorPayload.message = 'Error: Please provide a valid service object';
        errorPayload.response = validateService.errors;
        return reject(errorPayload);
      }
      const product = service.product;

      console.log(product, "++++++++++++++")

      const channelName = channel.toUpperCase();
      const soapURL = config.airtel_options.endpoints.subscription
        .replace('<IP>', config.airtel_options.host)
        .replace('<PORT>', config.airtel_options.port);
      const xmlRequestPayload = config.airtel_options.soap_xml.subscription
        .replace('[cp_id]', parseInt(service.cpID))
        .replace('[cp_password]', service.cpPassword)
        .replace('[cp_name]', service.cpName)
        .replace('[channel_name]', channelName)
        .replace('[msisdn]', msisdn)
        .replace('[product_id]', product.productId)
        .replace('[firstConfirmationDTTM]', moment().toISOString());
 
      const self = this;
      return unirest
        .post(soapURL)
        .headers({ SOAPAction: 'CallSubscription', Accept: 'application/xml', 'Content-Type': 'application/xml' })
        .timeout(config.airtel_options.timeout)
        .send(xmlRequestPayload)
        .end((response) => {
          // eslint-disable-next-line quotes
          console.log("__________________________MARK 1 _____________________________")
          console.log(soapURL)
          console.log("__________________________MARK 2 _____________________________")
          console.log(response)
          console.log("__________________________MARK 3 _____________________________")
          console.log(xmlRequestPayload)
          console.log("__________________________MARK 3 _____________________________")


          // console.log(soapURL, response, xmlRequestPayload, "response body here  ++++++++++++++")
          // something came back as the response...
          if (response && response.body) {
            
            
            // will save the response string in the db as well
            const responseString = response.body.toString('utf8');

        
          
            self.logger.info(`Subscription SOAP Response Body for ${xmlRequestPayload} === ${responseString}`);
            let responseJsonData = Sanitizer.xmltoJSON(responseString);
            console.log(responseJsonData, "responsedata")
            responseJsonData = responseJsonData
              .Envelope
              .Body
              .handleNewSubscriptionResponse
              .handleNewSubscriptionReturn;


            switch (responseJsonData.errorCode) {
              case '1000': {
                // Fetch correct amount based on returned product ID because
                // susbcription can be on a fallback product ID
                return this.dcbService.fetchServiceDetails(responseJsonData.productId)
                  .then((serviceDetails) => {
                    const subscribedService = JSON.parse(serviceDetails.product);
                    // successfully subscribed user, update our records and notify TerraVAS
                    const subscriptionData = {
                      msisdn,
                      campaignId: service.campaignId,
                      productId: responseJsonData.productId,
                      amount: parseFloat(responseJsonData.amount),
                      status: config.user_status.active,
                      type: config.airtel_request_type.sub,
                      chargingTime: responseJsonData.chargigTime,
                      response: responseString,
                      duration: subscribedService.duration,
                      transactionId: responseJsonData.xactionId,
                      route,
                    };

                    // push the data to a queue so we can save later as request logs
                    return this.rabbitMQClientHelper
                      .publish(subscriptionData, config.rabbit_mq.queues.airtel_se_requests_log)
                      .then((status) => {
                        this.logger.info(`successfully pushed to the Airtel subscription data queue: ${status}`);
                        return resolve({
                          error: false,
                          message: `Subscription is successful for ${service.name}`,
                          response: subscriptionData,
                        });
                      })
                      .catch((error) => {
                        // error occurred while pushing to queue
                        this.logger.error(`Could not push Airtel subscription to queue to be saved later in MongoDB: ${error}`);
                        this.logger.error(`Data not pushed : ${JSON.stringify(subscriptionData)}`);
                        return resolve({
                          error: false,
                          message: `Subscription is successful for ${service.name}`,
                          response: subscriptionData,
                        });
                      });
                  });
              }
              case '3003': {
                return reject(SEError.USER_ALREADY_SUBSCRIBED);
              }
              case '3004': {
                return reject(SEError.PRODUCT_NOT_MAPPED_TO_CP);
              }
              case '3006': {
                return reject(SEError.AIRTEL_DUPLICATE_REQUEST);
              }
              case '3101': {
                return reject(SEError.INVALID_SUBSCRIBER);
              }
              case '3109': {
                return reject(SEError.AIRTEL_CHARGING_ERROR);
              }
              case '3404': {
                return reject(SEError.USER_BALANCE_INSUFFICIENT);
              }
              case '4000': {
                return reject(SEError.AIRTEL_INTERNAL_ERROR);
              }
              default: {
                const error = {
                  error: true,
                  message: "Error occurred while subscribing user on Airtel SE's end",
                  response: responseJsonData,
                };
                return reject(error);
              }
            }
          }
    
          return reject(SEError.EMPTY_RESPONSE_FROM_AIRTEL);
        });
    });
  },


  /**
     * Send an unsubscription request using SOAP to the Airtel's SE
     *
     * @param msisdn Phone number to unsusbcribe
     * @param service Service Object
     * @param route Source of Unsubscription Request
     *  @returns {Promise}
     */
  sendUnSubscriptionRequest(msisdn, service, route) {
    return new Promise((resolve, reject) => {
      const errorPayload = {
        error: true,
        message: 'Empty Response: Airtel SE returned an empty response while unsubscribing user',
      };

      const validateService = ServiceHelper.validateServiceInfo(service);

      // no service data was passed...
      if (!service || validateService.error) {
        errorPayload.message = 'Error: Please provide a valid service object';
        errorPayload.response = validateService.errors;
        return reject(errorPayload);
      }

      const product = JSON.parse(service.product);

      const soapURL = config.airtel_options.endpoints.subscription
        .replace('<IP>', config.airtel_options.host)
        .replace('<PORT>', config.airtel_options.port);
      const xmlRequestPayload = config.airtel_options.soap_xml.un_subscription
        .replace('[cp_id]', parseInt(service.cpID))
        .replace('[cp_password]', service.cpPassword)
        .replace('[msisdn]', msisdn)
        .replace('[product_id]', product.productId);

      const self = this;
      // Send soap request here to Airtel's SE
      return unirest
        .post(soapURL)
        .headers({ SOAPAction: 'CallSubscription', Accept: 'application/xml', 'Content-Type': 'application/xml' })
        .send(xmlRequestPayload)
        .end((response) => {
          // something came back as the response...
          if (response && response.body) {
            const responseString = response.body.toString('utf8');
            self.logger.info(`Unsubscription SOAP Response Body for ${xmlRequestPayload} === ${responseString}`);
            let responseJsonData = Sanitizer.xmltoJSON(responseString);
            responseJsonData = responseJsonData
              .Envelope
              .Body
              .handleDeSubscriptionResponse
              .handleDeSubscriptionReturn;

            switch (responseJsonData.errorCode) {
              case '1001': {
                // successfully unsubscribed user, update our records and notify TerraVAS
                const unsubscriptionData = {
                  msisdn,
                  campaignId: service.campaignId,
                  productId: product.productId,
                  status: config.user_status.inactive,
                  type: config.airtel_request_type.unsub,
                  chargingTime: responseJsonData.chargigTime,
                  response: responseString,
                  transactionId: responseJsonData.xactionId,
                  route,
                };

                // push the data to a queue so we can save later as request logs
                return this.rabbitMQClientHelper
                  .publish(unsubscriptionData, config.rabbit_mq.queues.airtel_se_requests_log)
                  .then((status) => {
                    this.logger.info(`successfully pushed to the Airtel SE Requests data queue : ${status}`);
                    return resolve({
                      error: false,
                      message: 'Unsubscription was successful',
                      response: unsubscriptionData,
                    });
                  })
                  .catch((error) => {
                    this.logger.error(`could not push Airtel SE Requests to queue to be saved later in MongoDB: ${error}`);
                    return resolve({
                      error: false,
                      message: 'Unsubscription was successful',
                      response: unsubscriptionData,
                    });
                  });
              }
              case '3016': {
                return reject(SEError.USER_NOT_SUBSCRIBED);
              }
              case '3020': {
                return reject(SEError.USER_NOT_SUBSCRIBED);
              }
              case '3015': {
                return reject(SEError.INVALID_PRODUCT_ID);
              }
              case '3000': {
                return reject(SEError.AIRTEL_INTERNAL_ERROR);
              }
              default: {
                const error = {
                  error: true,
                  message: "Error occurred while unsubscribing user on Airtel SE's end",
                };
                return reject(error);
              }
            }
          }
          return reject(SEError.EMPTY_RESPONSE_FROM_AIRTEL);
        });
    });
  },

};

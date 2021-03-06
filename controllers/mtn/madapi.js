/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const TerraLogger = require('terra-logger')
const MTNMADAPIAPIHandler = require('../../lib/mtn/madapi');
const ResponseManager = require('../../commons/response');

const config = require('../../config')
const publish = require('../../rabbitmq/producer')


module.exports = {

	async smsOutbound(req, res) {

    try {
      const token = await MTNMADAPIAPIHandler.generateToken();

      if(token){
        console.log('token here', token)
        const result = await MTNMADAPIAPIHandler.sendSmsMT(req.body, token);
  
        return ResponseManager.sendResponse({
          res,
          message: `SMS sent`,
          responseBody: result,
        });
  
      }
    } catch (error){
      console.log('Error sending SMS', error)
      return ResponseManager.sendErrorResponse({
        res,
        message: `Error sending SMS`,
      })
    }
  

	},

  async getToken(req, res) {
    try {
      const token = await MTNMADAPIAPIHandler.generateToken();
      return ResponseManager.sendResponse({
        res,
        message: { access_token: token },
      })
    } catch (error) {
      console.log(error)
      return ResponseManager.sendResponse({
        res,
        message: 'Server Error: unable to process request, please try again later.',
      })
    }
  },

  async subscribeShortcode(req, res){
    try {
      const token = await MTNMADAPIAPIHandler.generateToken();

      if(token){
        console.log('token here', token)
        const payload = {
          data: req.body,
          shortCode: req.params.shortcode,
        }
        const result = await MTNMADAPIAPIHandler.registerShortcode(payload, token);
  
        return ResponseManager.sendResponse({
          res,
          message: `Shortcode registered`,
          responseBody: result,
        });
  
      }
    } catch (error){
      console.log('Error subscribing shortcode', error.response)
      return ResponseManager.sendErrorResponse({
        res,
        message: `Error subscribing shortcode`,
      })
    }
  },

  async unSbscribeShortcode(req, res){
    try {
      const token = await MTNMADAPIAPIHandler.generateToken();

      if(token){
        console.log('token here', token);

        // get subscriptionId
        const payload = {
          subscriptionId: req.params.requestId,
          shortCode: req.params.shortcode,
        }

        const result = await MTNMADAPIAPIHandler.unRegisterShortcode(payload, token);
  
        return ResponseManager.sendResponse({
          res,
          message: `Shortcode unregistered`,
          responseBody: result,
        });
  
      }
    } catch (error){
      console.log('Error unregistering shortcode', error)
      return ResponseManager.sendErrorResponse({
        res,
        message: `Error unregistering shortcode`,
      })
    }
  },

  async getDeliveryStatus(req, res) {
	  try {
			const token = await MTNMADAPIAPIHandler.generateToken();

			const { requestId, shortCode } = req.params// 'a29285c1-bcb7-467d-bc85-b574c276bc29'

      if(token){
        const deliveryStatus = await MTNMADAPIAPIHandler.deliveryStatus(token, shortCode, requestId);
        if (deliveryStatus.error) {
          return ResponseManager.sendErrorResponse({
            res,
            message: { error: deliveryStatus.error },
          })
        }
  
        return ResponseManager.sendResponse({
          res,
          message: { deliveryStatus },
        })
      }
		
		} catch (error) {
			return ResponseManager.sendErrorResponse({
				res,
				message: 'Server Error: unable to process delivery status',
			})
		}
	},

  async getCustomerSubscriptionProfile(req, res) {
	  try {
			const token = config.mtn_madapi_xApiKey;

			const { customerId } = req.params;

      if(token){
        const subscriptions = await MTNMADAPIAPIHandler.getSubscriptions(token, customerId);

        console.log("subscriptionsProfile: ", subscriptions);
  
        return ResponseManager.sendResponse({
          res,
          message: 'subscriptions fetched successfully',
          responseBody: subscriptions,
        })
      }
		
		} catch (error) {
			return ResponseManager.sendErrorResponse({
				res,
				message: 'Server Error: unable to process delivery status',
			})
		}
	},

  async subscribeUser(req, res) {
	  try {
			const token = config.mtn_madapi_xApiKey;

      console.log("token: ", token);

			const { customerId } = req.params;

      if(token){

        const payload = {
          customerId,
          body: req.body,
        }

        const subscription = await MTNMADAPIAPIHandler.subscribe(token, payload);

        console.log("subscription: ", subscription);
  
        return ResponseManager.sendResponse({
          res,
          message: 'User successfully subscribed',
          responseBody: subscription,
        })
      }
		
		} catch (error) {
      console.log("error: ", error);
			return ResponseManager.sendErrorResponse({
				res,
				message: 'Server Error: unable to process delivery status',
			})
		}
	},

  async dataSync(req, res) {
	  try {
			console.log("request: ", req.body);
      res.status(200).json({ data: "Ok" });

      const data = req.body;

      const dataToSend = {
        msisdn: data.callingParty,
        status: data.result.toLowerCase(),
        meta: {
          updateTime: '20220217203321',
          effectiveTime: '20220217203321',
          expiryTime: '20220224203321',
          serviceAvailability: '0',
          fee: data.chargeAmount,
          keyword: data.keyword,
          cycleEndTime: '20220224203321',
          Starttime: '20220217203321'
        },
        network: "mtn",
        serviceId: data.serviceId,
        chargingMode: data.chargingMode,
        operationId: data.operationId,
        message: data.operationId,
        transactionId: generateId(),
        subType: ""
      }

      if (dataToSend.chargingMode === 'S' || dataToSend.chargingMode === 'E') {

        console.log('operationId', dataToSend.operationId)
        console.log('chargingMode', dataToSend.chargingMode)
        const acceptedOperationId = ['SN', 'SR', 'SAA', 'PN', 'ES', 'YR', 'GR', 'RR'];

        if (acceptedOperationId.includes(dataToSend.operationId)) {
          dataToSend.subType = dataToSend.message === ('YR' || 'GR' || 'RR') ? 'RENEWAL' : 'NEW'
          console.log('Final |Data To Send', dataToSend)
          return publish(config.rabbit_mq.mtn.subscription_postback_queue, {
            ...dataToSend,
          })
          .then(() => {
            TerraLogger.debug('successfully pushed postback data to queue')
            return;
          })
          .catch((err) => {
            console.log(`Unable to push postback data to queue, ${err}`);
            return;
          })
        }
      }
  
      const unsubOperationId = ['ACI', 'SAC', 'YD', 'GD', 'RD', 'PCI', 'GCI', 'SCI', 'BCI', 'ACE', 'YG', 'YS'];
      if (unsubOperationId.includes(dataToSend.operationId)) {
        dataToSend.status = 'success';
        return publish(config.rabbit_mq.mtn.un_subscription_queue, {
          ...dataToSend,
        })
          .then(() => {
            TerraLogger.debug('successfully pushed postback data to queue')
            return
          })
          .catch((err) => {
            console.log(`Unable to push postback data to queue, ${err}`);
            return;
          })
      }
		
		} catch (error) {
      console.log("error: ", error);
			return;
		}
	},

  async deleteAllSubscriptions(req, res) {
	  try {
			const token = await MTNMADAPIAPIHandler.generateToken();

			const { customerId } = req.params;

      if(token){
        const subscription = await MTNMADAPIAPIHandler.deleteSubscriptions(token, customerId);
  
        return ResponseManager.sendResponse({
          res,
          message: 'User successfully subscribed',
          responseBody: subscription,
        })
      }
		
		} catch (error) {
			return ResponseManager.sendErrorResponse({
				res,
				message: 'Server Error: unable to process delivery status',
			})
		}
	},

  async getCustomerSubscriptionHistory(req, res) {
	  try {
			const token = config.mtn_madapi_xApiKey;

      if(token){
        const subscriptions = await MTNMADAPIAPIHandler.getSubscriptionHistory(token, req.params);

        console.log("subscriptionsHistory: ", subscriptions)
  
        return ResponseManager.sendResponse({
          res,
          message: 'subscription fetched successfully',
          responseBody: subscriptions,
        })
      }
		
		} catch (error) {
			return ResponseManager.sendErrorResponse({
				res,
				message: 'Server Error: unable to process delivery status',
			})
		}
	},

  async deleteSubscription(req, res) {
    let errorResponse;
	  try {
			const token = config.mtn_madapi_xApiKey;

      if(token){
        const subscriptions = await MTNMADAPIAPIHandler.deleteSubscription(token, req.body);

        // if (subscriptions.error) {
        //   errorResponse = subscriptions
        //   throw new Error(subscriptions.message);
        // }
  
        return ResponseManager.sendResponse({
          res,
          message: 'subscription deleted successfully',
          responseBody: subscriptions,
        })
      }
		
		} catch (error) {
      console.log("unsubscription error: ", error.response.data)
			return ResponseManager.sendErrorResponse({
				res,
        statusCode: 400,
				message: 'Unable to process unsubscription.',
        responseBody: errorResponse,
			})
		}
	},
  
}

function generateId() {
	return new Date().valueOf();
}

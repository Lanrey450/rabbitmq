/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase


const MTNMADAPIAPIHandler = require('../../lib/mtn/madapi');
const ResponseManager = require('../../commons/response');

const config = require('../../config')


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
      return res.status(200).send("MTN DATA SYNC");
		
		} catch (error) {
      console.log("error: ", error);
			return ResponseManager.sendErrorResponse({
				res,
				message: 'Server Error: MTN DATA SYNC',
			})
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

        if (subscriptions.error) {
          errorResponse = subscriptions
          throw new Error(subscriptions.message);
        }
  
        return ResponseManager.sendResponse({
          res,
          message: 'subscription deleted successfully',
          responseBody: subscriptions,
        })
      }
		
		} catch (error) {
      console.log("unsubscription error: ", error)
			return ResponseManager.sendErrorResponse({
				res,
        statusCode: 400,
				message: 'Unable to process unsubscription.',
        responseBody: errorResponse,
			})
		}
	},
  
}

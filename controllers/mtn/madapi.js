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

			const { customerId } = req.params;

      if(token){

        const payload = {
          customerId,
          body: req.body,
        }

        const subscription = await MTNMADAPIAPIHandler.subscribe(token, payload);
  
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
	  try {
			const token = config.mtn_madapi_xApiKey;

      if(token){
        const subscriptions = await MTNMADAPIAPIHandler.deleteSubscription(token, req.params);
  
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
  
}

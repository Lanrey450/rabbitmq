/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase


const MTNMADAPIAPIHandler = require('../../lib/mtn/madapi');
const ResponseManager = require('../../commons/response');


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
      console.log('Error subscribing shortcode', error)
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
          subscriptionId: '',
          shortCode: req.params.shortCode,
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
  }
  
}

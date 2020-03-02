const Utils = require('../../lib/utils');
const ResponseManager = require('../../commons/response');
const MTNSDPAPIHandler = require('../../lib/mtn/subscription');
const config = require('../../config');

module.exports = {
    async subscribe(req, res){
        const service_password = config.mtn.serviceConfig.servicePassword;
        const service_id = config.mtn.serviceConfig.serviceID;

        const { msisdn, product_id} = req.body;
        if(!msisdn || !product_id){
            console.log('pass msisdn and product_id');
            return res.errorResponse({
                message: 'pass msisdn and product_id',
              });
        }
        const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false);
        let data = {
            'spId': service_id,
            'spPwd': service_password,
            'productid': req.body.product_id
        }

        try {
            const subscribedResponse = await MTNSDPAPIHandler.subscribe(sanitized_msisdn, data);

            return res.successResponse({
                message: 'Subscription was successful',
                data: subscribedResponse,
            });
        }

        catch(error){
            return res.errorResponse({
                message: 'subscription call failed!',
                data: error
              });
        }
    },

    async unsubscribe(req, res){
        const service_password = config.mtn.serviceConfig.servicePassword;
        const service_id = config.mtn.serviceConfig.serviceID;

        const { msisdn, product_id} = req.body;
        if(!msisdn || !product_id){
            console.log('pass msisdn and product_id');
            return res.errorResponse({
                message: 'pass msisdn and product_id',
              });
        }
        const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false);
        let data = {
            'spId': service_id,
            'spPwd': service_password,
            'productid': req.body.product_id
        }

        try {
            const UnSubscribedResponse = await MTNSDPAPIHandler.unsubscribe(sanitized_msisdn, data)

            return res.successResponse({
                message: 'Subscription was successfully removed',
                data: UnSubscribedResponse,
            });
        }
        catch(error){
            return res.errorResponse({
                message: 'unsubscription call failed!',
                data: error
              });
        }
    },

    async status(req, res){
        ResponseManager.sendResponse({
            res,
            responseBody: await MTNSDPAPIHandler.status(req.body)
        });
    }
}

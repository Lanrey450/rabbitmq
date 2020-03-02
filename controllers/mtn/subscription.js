const Utils = require('../../lib/utils');
const ResponseManager = require('../../commons/response');
const MTNSDPAPIHandler = require('../../lib/mtn/subscription');
const config = require('../../config');

module.exports = {
    async subscribe(req, res){
        
        const { service_id, service_password, msisdn, product_id } = req.body;
        if(!msisdn || !product_id){
            console.log('pass msisdn and product_id');
            ResponseManager.sendErrorResponse({
                res,
                message: 'pass msisdn and product_id',
                responseBody: error
            });
            return;
        }
        const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false);
        let data = {
            'spId': service_id,
            'spPwd': service_password,
            'productid': req.body.product_id
        }

        try {
            const subscribedResponse = await MTNSDPAPIHandler.subscribe(sanitized_msisdn, data);

            ResponseManager.sendResponse({
                res,
                message: 'Subscription was successful',
                responseBody: subscribedResponse
            });
            return;
        }

        catch(error){
            ResponseManager.sendErrorResponse({
                res,
                message: 'subscription call failed!',
                responseBody: error
            });
            return;
        }
    },

    async unsubscribe(req, res){

        const { service_id, service_password, msisdn, product_id } = req.body;
        if(!msisdn || !product_id){
            console.log('pass msisdn and product_id');
            ResponseManager.sendErrorResponse({
                res,
                message: 'pass msisdn and product_id',
                responseBody: error
            });
            return;
        }
        const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false);
        let data = {
            'spId': service_id,
            'spPwd': service_password,
            'productid': req.body.product_id
        }

        try {
            const UnSubscribedResponse = await MTNSDPAPIHandler.unsubscribe(sanitized_msisdn, data)

            ResponseManager.sendResponse({
                res,
                message: 'Subscription was successfully removed',
                responseBody: UnSubscribedResponse
            });
            return;
        }
        catch(error){
            ResponseManager.sendErrorResponse({
                res,
                message: 'unsubscription call failed!',
                responseBody: error
            });
            return;
        }
    },

    async status(req, res){

        ResponseManager.sendResponse({
            res,
            responseBody: []
        });
    }
}

const Utils = require('../../lib/utils');
const ResponseManager = require('../../commons/response');
const MTNSDPAPIHandler = require('../../lib/mtn/subscription');
const config = require('../../config');
const publish = require('../../rabbitmq/producer')

module.exports = {
    async subscribe(req, res){

        const { service_id, service_password, msisdn, product_id } = req.body;
        if(!msisdn || !product_id){
            console.log('pass msisdn and product_id');
            ResponseManager.sendErrorResponse({
                res,
                message: 'pass msisdn and product_id',
            });
            return;
        }
        const sanitized_msisdn = Utils.msisdnSanitizer(msisdn, false);
        let data = {
            'spId': service_id,
            'spPwd': service_password,
            'productid': product_id
        }

        try {
            const subscribedResponse = await MTNSDPAPIHandler.subscribe(sanitized_msisdn, data);

            if(subscribedResponse.ResultCode == 1){
                ResponseManager.sendErrorResponse({
                    res,
                    message: 'subscription call failed!',
                    responseBody: subscribedResponse
                });
                return;
            }
            try{
                publish(config.rabbit_mq.queue, subscribedResponse)
                .then((status) => {
                    console.info(`successfully pushed to the MTN subscription data queue: ${status}`);
                    ResponseManager.sendResponse({
                        res,
                        message: 'Subscription was successful',
                        responseBody: subscribedResponse
                    });
                    return;             
                });
            }
            catch(err){
                ResponseManager.sendErrorResponse({
                    res,
                    message: 'unable to push subscription data to queue',
                    responseBody: err
                });
                return;
            }
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
        console.log(req.body);

        if(!msisdn || !product_id){
            console.log('pass msisdn and product_id');
            ResponseManager.sendErrorResponse({
                res,
                message: 'pass msisdn and product_id',
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

            if(UnSubscribedResponse.ResultCode == 1){
                ResponseManager.sendErrorResponse({
                    res,
                    message: 'unsubscription call failed!',
                    responseBody: error
                });
                return;
            }
            try{
                publish(config.rabbit_mq.queue, UnSubscribedResponse)
                .then((status) => {
                    console.info(`successfully pushed to the MTN subscription data queue: ${status}`);
                    ResponseManager.sendResponse({
                        res,
                        message: 'Subscription was successfully removed',
                        responseBody: UnSubscribedResponse
                    });
                    return;             
                });
            }
            catch(err){
                ResponseManager.sendErrorResponse({
                    res,
                    message: 'unable to push unsubscription request data to queue',
                    responseBody: err
                });
                return;
            }
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
        const { msisdn, serviceId } = req.query;
        if (!msisdn || !serviceId) {
            ResponseManager.sendErrorResponse({
                res,
                message: 'msisdn and serviceId are required in query param',
            });
            return;
        }

        MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId).catch( error =>{
            ResponseManager.sendErrorResponse({
                res,
                responseBody: error,
                message: 'Unable to get subscription'
            });
            return;
        });

        const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId);

        if(subscriptionDetail){
            ResponseManager.sendResponse({
                res,
                responseBody: response,
                message: 'status was succesfully fetched'
            });
            return;
        }
        ResponseManager.sendErrorResponse({
            res,
            message: 'Subscription does not exist'
        });
    },

    async MTNDataSyncPostBack(req, res) {
        console.log('getting data sync feedback from mtn');
        const data = req.body;
        console.log(data);
    }
    
}

const SubscriptionModel = require('../../models/mtn/subscription');
const UnSubscriptionModel = require('../../models/mtn/subscription');
const PostbackModel = require('../../models/mtn/subscription');
const ResponseManager = require('../../commons/response')
const consume = require('../../rabbitmq/consumer');
const config = require('../../config');

module.exports = {
    saveConsumedSubscriptionData(){
        consumeHandler(config.rabbit_mq.mtn.subscription_queue, SubscriptionModel)
    },
    saveConsumedUnSubscriptionData(){
        consumeHandler(config.rabbit_mq.mtn.un_subscription_queue, UnSubscriptionModel)
    },
    saveConsumedPostbackData(){
        consumeHandler(config.rabbit_mq.mtn.postback_queue, PostbackModel)
    }
}

function consumeHandler(queue, model){
    consume(queue, async(err, msg)=>{
        if(err){
            ResponseManager.sendErrorResponse({
                res,
                message: 'rabbitmq connection failed!',
                responseBody: err,
            });
            return
        }
        if(msg == null){
            ResponseManager.sendErrorResponse({
                res,
                message: 'the queue is empty at the moment',
            });
            return
        }
        if(msg != null){
            try{
                const data = await model.create(msg);
                if(data){
                    ResponseManager.sendResponse({
                        res,
                        message: 'Success',
                        responseBody: data,
                    });
                }
            }
            catch(error){
                ResponseManager.sendErrorResponse({
                    res,
                    message: 'unable to save data to mongodb',
                });
                return
            }
        }
    });
}
const ResponseManager = require('../../commons/response');
const NineMobileApi = new (require('../../lib/9Mobile/subscription'));
const TerraLogger = require('terra-logger');

class SubscriptionController extends ResponseManager{
    constructor(){
        super();
    }

    async subscribe(req, res){
        this.sendResponse({
            res,
            responseBody: await NineMobileApi.subscribe(req.body)
        });
    }

    async unsubscribe(req, res){
        this.sendResponse({
            res,
            responseBody: await NineMobileApi.unsubscribe(req.body)
        });
    }

    async status(req, res){
        this.sendResponse({
            res,
            responseBody: await NineMobileApi.status(req.body)
        });
    }
}

module.exports = SubscriptionController;
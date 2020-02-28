const ResponseManager = require('../../commons/response');
const NineMobileApi = require('../../lib/9Mobile/subscription');

module.exports = {
    async subscribe(req, res){
        ResponseManager.sendResponse({
            res,
            responseBody: await NineMobileApi.subscribe(req.body)
        });
    },

    async unsubscribe(req, res){
        ResponseManager.sendResponse({
            res,
            responseBody: await NineMobileApi.unsubscribe(req.body)
        });
    },

    async status(req, res){
        ResponseManager.sendResponse({
            res,
            responseBody: await NineMobileApi.status(req.body)
        });
    }
}

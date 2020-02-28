const ResponseManager = require('../../commons/response');
const NineMobileChargeApi = new (require('../../lib/9Mobile/charging'));
const TerraLogger = require('terra-logger');

class  ChargeController extends ResponseManager{
    constructor(){
        super();
    }

    async chargeSync(req, res){
        this.sendResponse({
            res,
            responseBody: await NineMobileChargeApi.sync(req.body)
        });
    }

    async chargeAsync(req, res){
        this.sendResponse({
            res,
            responseBody: await NineMobileChargeApi.async(req.body)
        });
    }

}

module.exports = ChargeController;
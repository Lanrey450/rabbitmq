const ResponseManager = require('../../commons/response');
const NineMobileChargeApi = require('../../lib/9Mobile/charging');

   module.exports = {
        async chargeSync(req, res){
            ResponseManager.sendResponse({
                res,
                responseBody: await NineMobileChargeApi.sync(req.body)
            });
        },

        async chargeAsync(req, res){
            ResponseManager.sendResponse({
                res,
                responseBody: await NineMobileChargeApi.async(req.body)
            });
        }
   }

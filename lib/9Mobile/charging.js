const chargeHandler = require('./index');

    module.exports = {
        async(body){
            return chargeHandler.postRequest(`/charge/async`, body);
        },
    
        sync(body){
            return chargeHandler.postRequest(`/charge/sync`, body);
        }
    }
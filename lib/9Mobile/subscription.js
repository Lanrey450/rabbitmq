const subscriptionHandler = require('./index');

    module.exports = {
        subscribe(body){
            return subscriptionHandler.postRequest(`/subscription/optin`, body);
        },
    
        unsubscribe(body){
            return subscriptionHandler.postRequest(`/subscription/optout`, body);
        },
    
        status(body){
            return subscriptionHandler.postRequest(`/subscription/status`, body);
        }
    }

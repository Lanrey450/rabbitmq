const Base = require('./index');
class Subscription extends Base {

    subscribe(body){
        return this.postRequest(`/subscription/optin`, body);
    }

    unsubscribe(body){
        return this.postRequest(`/subscription/optout`, body);
    }

    status(body){
        return this.postRequest(`/subscription/status`, body);
    }
}


module.exports = Subscription;
const Base = require('./index');
class Charge extends Base {

    async(body){
        return this.postRequest(`/charge/async`, body);
    }

    sync(body){
        return this.postRequest(`/charge/sync`, body);
    }
}


module.exports = Charge;
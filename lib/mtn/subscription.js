const mtn_sdp = require('mtn-sdp-nodejs');
const Subscription = require('../../models/mtn/subscription');

    module.exports = {
        async subscribe(msisdn, data){
            return new Promise((resolve, reject) => {
            
                    mtn_sdp.subscribe(msisdn, data, false, async (err, resp) => {
                    if (err) {
                      console.log(err, 'Error from MTN!');
                      reject(err);
                    }
                    if (resp) {
                        resolve(resp);
                    }
                  })
              })
        },
    
        async unsubscribe(msisdn, data){

            mtn_sdp.unsubscribe(msisdn, data, false, async (err, resp) => {
            if (err) {
                console.log(err, 'Error from MTN!')
                reject(err);
            }
            if (resp) {
                console.log('response from MTN', resp);
                resolve(resp);
            }
            })
        },
    
        async status(body){
            console.log('In the nutshell', body);
            return
        }
    }

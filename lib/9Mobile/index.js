const axios = require('axios');
const config = require('../../config');
const baseUrl = config.nineMobile.baseUrl
const CryptoJs = require('crypto-js');

const transactionId = 22;

module.exports = {
        async postRequest(path, body){
            return (await axios.post(baseUrl + path, body, {
                headers:{
                    username: config.nineMobile.username,
                    'Ocp-Apim-Subscription-Key': config.nineMobile.apiSubscriptionKey,
                    'external-tx-id': body.txId? body.txId : generateTransactionId()
                }
            })).data;
        }
    
    }

        // function getAuthenticationHeader(){
        //     return CryptoJs.AES.encrypt(`${config.nineMobile.partnerRoleId}#${Date.now()}`, config.nineMobile.preSharedKey, {
        //         mode: CryptoJs.mode.ECB,
        //         padding: CryptoJs.pad.Pkcs7
        //     }).toString();
        // }

        function generateTransactionId(){
            const date = new Date();
            const day = ("0" + (date.getMonth() + 1)).slice(-2);
            const hour = date.getHours();
            const minute = ("0" + (date.getMinutes() + 1)).slice(-2);
            const seconds = ("0" + (date.getSeconds() + 1)).slice(-2);
            const id = transactionId +1;
            const getTransactionSerial = number => number <= 9999999 ? `000000${number}`.slice(-7) : number;

            return`${config.nineMobile.aggregatorId}${date.getFullYear()}${date.getMonth()}${day}${hour}${minute}${seconds}${getTransactionSerial(id)}`
}
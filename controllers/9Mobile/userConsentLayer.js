

const config = require('../../config');
const redis = require('redis')


module.exports = {
    
async userConsent(req, res){

    const {msisdn, message} = req.body;

     message = message.trim();
    if (message.toLowerCase() === "help"){
        const keywordConfig = keywordConfigs.find(config => config.keyword === currentService);
        return keywordConfig.confirmResponse;
    }
    if (message.toLowerCase() === "stop"){
        const existingSession = sessions.find(session => session.msisdn === msisdn);
        if (!existingSession){
            return "No active service";
        }
    let keywordConfig = keywordConfigs.find(config => config.keyword === existingSession.keyword);

        return `You have unsubscribed from the ${keywordConfig.name} service.`
    }
​
    let keywordConfig = keywordConfigs.find(config => config.keyword === message);
​
    if (keywordConfig){
        const existingSession = sessions.find(session => session.msisdn === msisdn);
        if (existingSession){
            existingSession.keyword = message;
        } else {
            sessions.push({msisdn, keyword: message});
        }
        return keywordConfig.confirmResponse
    }
​
    const existingSession = sessions.find(session => session.msisdn === msisdn);
​
    if (!existingSession){
        return;
    }
​
    keywordConfig = keywordConfigs.find(config => config.keyword === existingSession.keyword);
​
​
    if (message === "1"){
        try{
            await subscriberUser(msisdn, existingSession.keyword, "SMS", 1);
            console.log("success");
            return keywordConfig.successResponse;
        } catch (e){
            console.error(e);
            return "Sorry. The subscription could not be processed."
        }
    } else if (message === "2"){
        try{
            await subscriberUser(msisdn, existingSession.keyword, "SMS", 2);
            console.log("success");
​
            return keywordConfig.autorenewResponse;
        } catch (e){
            console.error(e);
            return "Sorry. The subscription could not be processed."
        }
​
    }
​
}
};
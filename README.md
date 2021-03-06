## AGGREGATOR BILLING AND CHARGING API

Entities
- aggregator_platform (AG) :  This calls our endpoints to subscribe and charge users on MTN, Airtel and 9Mobile
- global_subscription_and_billing_engine (GSBE) : that is this application
- telcos (9mobile, Airtel and MTN)

## Installation

Ensure you have the below required softwares installed before you can configure aggregator_subscription_and_billing locally.

- **Node** version >= 12.0.0
- **npm** version >= 6.13.4
- **mongodb**
- **redis**
---
## Configuration
After a successful installation of the above stated softwares, copy the below command to your terminal to clone the project 

```bash
git clone git@bitbucket.org:terragonengineering/aggregator_subscription_and_billing.git
```
After cloning the project, run the command below to install all the required node modules.

```bash
npm install
```
---
## Contributors 
**(Abass Makinde)** - <madekunle@terragonltd.com>

**(Alexander Nnakwue)** - <annakwue@terragonltd.com>

**(Ariyo Apakama)** - <aapakama@terragonltd.com>

---

## Operating instruction
- Authorization is needed for this software, it can be found in postman collection (username & password)
- Dont't forget to create a `.env` file, update it with the content of `.env.example` file in the project directory.
- To start this software, run the first command below, and to run in development mode you can run the second command.

```bash
npm start
npm dev
```
In this project, there are several consumers, to run them, simply run the appropriate one with the commands below
```bash
npm run mtn_subscription
npm run mtn_unsubscription
npm run mtn_postback
npm run airtel_subscription
npm run airtel_unsubscription
npm run airtel_postback
npm run nine_mobile_subscription
npm run nine_mobile_unsubscription
npm run nine_mobile_postback
```
---
### Known bugs
- Some mongodb schemas for MTN are not known yet, it will be fixed as at due time.
- Concurrent running of consumers is yet to be implemented.
- MTN subscription part has not been fully tested, due to some telco configs to be done.

---
### Subscription & Billing Routes (They are all HTTP)
Name                                         | Endpoint
------------------------------------------- | -------------------------------------------
(**GET**) Base endpoint                             | /subscription

***sample response***
```json
Welcome to the Aggregator subscription and billing Engine
```
---

#### Telco - Airtel

Name                                         | Endpoint
------------------------------------------- | -------------------------------------------
(**POST**) Subscription request                             | /subscription/airtel/subscribe
(**POST**) Unsubscription request                             | /subscription/airtel/unsubscribe
(**GET**) Check Subscrition status                             | /subscription/airtel/status
(**GET**) Postback call                             | /airtelPostback

**Subscription request**

Aggregator platform makes a subscription call to this API to subscribe for a product.

Sample subscription call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/airtel/subscribe```

***sample request***

```json
{
	"msisdn":"09020327785",
	"channel": "sms",
	"productId": "8202"
}
```

***sample response***

```json
{
    "data": {
        "error": false,
        "response": {
            "msisdn": "09020327785",
            "productId": "8202",
            "amount": 50,
            "status": "active",
            "type": "sub",
            "chargingTime": "2020-03-23T03:27:18.000Z",
            "transactionId": "-96824512",
            "channel": "sms"
        }
    },
    "status": true,
    "message": "success"
}
```


**Unsubscription request**

Aggregator platform makes a unsubscription call to this API to unsubscribe for a product.

sample unsubscription call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/airtel/unsubscribe```

***sample request***

```json
{
	"msisdn":"09020327785",
	"channel": "sms",
	"productId": "8202"
}
```

***sample response***

```json
{
    "data": {
        "error": false,
        "message": "Unsubscription was successful",
        "response": {
            "msisdn": "09020327785",
            "productId": "8202",
            "status": "inactive",
            "type": "unsub",
            "chargingTime": "2020-03-23T03:36:42.000Z",
            "amount": "0.0",
            "transactionId": "-96821323",
            "message": "Successful Deprovisioning",
            "lowBalance": "0.0",
            "temp1": "124",
            "temp2": "12788080565",
            "channel": "sms"
        }
    },
    "status": true,
    "message": "success"
}
```

**Subscription status**

Aggregator platform makes a subscription call to this API to check the status of a user subsription for a product.

***sample request***

```json
`http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/airtel/status?msisdn=09020327785&productId=8202`
```

***sample response***

```json
{
    "data": "active,
    "status": true,
}
```

**Postback call**

Postback feedback incoming from TELCO -Airtel

***sample request***

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:name="ariyo" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sub="http://SubscriptionEngine.ibm.com">
   <soapenv:Header/>
   <soapenv:Body>
      <sub:notificationToCP>
         <notificationRespDTO>
            <xactionId>0</xactionId>
            <errorCode>1</errorCode>
            <errorMsg>Success</errorMsg>
            <temp1>33</temp1>
            <temp2>0</temp2>
            <temp3>0</temp3>
            <lowBalance>0.0</lowBalance>
            <amount>1.0</amount>
            <chargigTime>2011-10-04T15:45:40.890Z</chargigTime>
            <msisdn>9999999999</msisdn>
            <productId>111</productId>
         </notificationRespDTO>
      </sub:notificationToCP>
   </soapenv:Body>
</soapenv:Envelope>
```

***sample response***

```json
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:name="ariyo" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sub="http://SubscriptionEngine.ibm.com">
   <soapenv:Header/>
   <soapenv:Body>
      <sub:notificationToCP>
         <notificationRespDTO>
            <xactionId>0</xactionId>
            <errorCode>1</errorCode>
            <errorMsg>Success</errorMsg>
            <temp1>33</temp1>
            <temp2>0</temp2>
            <temp3>0</temp3>
            <lowBalance>0.0</lowBalance>
            <amount>1.0</amount>
            <chargigTime>2011-10-04T15:45:40.890Z</chargigTime>
            <msisdn>9999999999</msisdn>
            <productId>111</productId>
         </notificationRespDTO>
      </sub:notificationToCP>
   </soapenv:Body>
</soapenv:Envelope>
```

### Sample JSON response showing the error code for user-initiated ubsubscription on the sub-bill engine

```{"args":{"notificationRespDTO":{"amount":0,"chargigTime":"2020-05-28T14:42:52.000Z","errorCode":1001,"errorMsg":"Start/Stop Initiated De-Subscription Success","lowBalance":0,"msisdn":"2349020327785","productId":8203,"temp1":"124","temp2":"12834639523","temp3":"<XML><ID>106834620</ID><ChargingType>null</ChargingType><VCode>null</VCode><partyB></partyB></XML>","xactionId":-50262365}}}```
---

#### Telco - MTN

Name                                         | Endpoint
------------------------------------------- | -------------------------------------------
(**POST**) Subscription request                             | /subscription/mtn/subscribe
(**POST**) Unsubscription request                             | /subscription/mtn/unsubscribe
(**GET**) Check Subscription request                             | /subscription/mtn/status
(**POST**) Postback call                             | /subscription/mtnPostBack

**Subscription request**

Aggregator platform makes a subscription call to this API to subscribe for a product.

sample subscription call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/mtn/subscribe```

***sample request***

```json
{
	"msisdn": "07064235801",
	"product_id": "23401220000028103"
}
```

***sample response***

```json
response goes here
```


**Unsubscription request**

Aggregator platform makes a unsubscription call to this API to unsubscribe for a product.

sample unsubscription call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/mtn/unsubscribe```

***sample request***

```json
{
	"msisdn": "07064235801",
	"product_id": "23401220000028103"
}
```

***sample response***

```json
response goes here
```

**Subscription status**

Aggregator platform makes a subscription call to this API to subscribe for a product.

***sample request***

```json
`http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/mtn/status?msisdn=07064235801&productId=23401220000028103`
```

***sample response***

```json
response goes here
```

**Postback call**

Postback feedback incoming from TELCO -MTN

***sample request***

```json

```

***sample response***

```json
response goes here
```
---

#### Telco - 9Mobile


Name                                         | Endpoint
------------------------------------------- | -------------------------------------------
(**POST**) Subscription request                             | subscription/nineMobile/subscribe
(**POST**) Unsubscription request                             | subscription/nineMobile/unsubscribe
(**POST**) Charge(sync/async) request                         |  /subscription/nineMobile/billing/async
(**GET**) Check Subscription status                             | /subscription/nineMobile/status

**Subscription request**

Aggregator platform makes a subscription call to this API to subscribe for a product.

sample subscription call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/nineMobile/subscribe```

***sample request***

```json
{
    "msisdn": "2348094195020",
    "shortCode": "64602",
    "serviceId": "NOVAJI_05-9JADEC20",
    "channel": "sms"
}
```

***sample response***

```json
{
    "status": true,
    "message": "Consent message successfully sent to the user with msisdn, 2348094195020"
}
```


**Unsubscription request**

Aggregator platform makes a unsubscription call to this API to unsubscribe for a product.

sample unsubscription call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/nineMobile/unsubscribe```

***sample request***

```json
{
	"msisdn":"2349098633488",
	"channel": "USSD",
	"serviceId": "TERRAGON_05-SBOU2"
}
```

***sample response***

```{
    "data": {
        "message": "null",
        "inError": false,
        "requestId": "26:1584940767418",
        "code": "SUCCESS",
        "responseData": {
            "transactionId": "ijordan2020203620260000023",
            "externalTxId": "ijordan2020203620260000023",
            "subscriptionResult": "OPTOUT_CANCELED_OK",
            "subscriptionError": "Optout one success"
        }
    },
    "status": true,
    "message": "success"
}
```

**Subscription status**

Aggregator platform makes a subscription call to this API to subscribe for a product.

***sample request***

```json
`http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/nineMobile/status?msisdn=2349098633488&channel=USSD&serviceId=TERRAGON_05-SBOU20`
```

***sample response***

```json
{
    "data": {
        "inError": false,
        "code": "SUCCESS",
        "responseData": {
            "subStartDate": "2020-03-23 06:15:09.91",
            "subscriptionStatus": "CANCELED"
        }
    },
    "status": true,
    "message": "success"
}
```

**Charging request**

Aggregator platform makes a charging call to this API to charge a user after successful subscription to a product.

sample charging call - ```http://staging-vas-aggregator-subscription-billing.terragonbase.com/subscription/nineMobile/billing/async```

***sample request***

```json
{
    "msisdin": "2348093597076",
    "serviceId": "TERRAGON_05-FBALL20"
}


```
***sample response***

```json

```

**Postback call**

Postback feedback incoming from TELCO -Airtel

***sample request***

```json

```

***sample response***

```json
response goes here
```
---


### Note

MTN-POSTBACK-SERVER-APP - `bitbucket.org/terragonengineering/mtn-sdp-postback-php.git`  (BRANCH -push_to_sub_bill_engine)
AIRTEL-POSTBACK-SERVER-APP - `bitbucket.org/terragonengineering/airtel-se-soap-postback-app.git` (BRANCH -push_to_sub_bill_engine)

The postback app for both MTN and Airtel gets the POSTBACK directly from the telco, converts the XML to JSON and posts the JSON data back to the subscription and billing engine for processing

9Mobile Flow
Action 1
    - AG calls "/nineMobile/subscribe" to initiate a subscription
        - we send out an sms MT to the user via the shortcode telling the user the keyword (either 1 for auto-renewal or 2 for one-off) to reply with, for the subscription to happen

    - 9Mobile then calls "/nineMobile/sms/mo" vai the gateway with the message sent by the user to the shortcode...This process is iterrative till consent portion is done
        - once consent is done we make a sync call to 9mobile's subscription endpoint to subscribe user and then send the response we get to a queue (nineMobile_subscription_queue)
        - a consumer gets the response and sends to the ******aggregator_subscription_feedback_queue, adds a flag to the data which tells us if the send to the url was successful and then saves the data to DB

    - after AG gets their feedback on aggregator_subscription_feedback_url, they call our "/nineMobile/billing/sync" or "/nineMobile/billing/async" endpoint to charge user and then we call the 9mobile's charge endpoint
        - when using "/nineMobile/charge/sync", an immediate response is given to AG from response gotten from 9mobile
        - when using "/nineMobile/charge/async", we make the call and give AG an initial feedback
            - 9mobile calls our "/nineMobilePostBack" endpoint, we send the data to a queue(nineMobile_postback_queue)
            - a consumer gets the data from the queue and sends to the ******aggregator_billing_feedback_queue, adds a flag to the data which tells us if the send to the url was successful and then saves the data to DB



NB - All feedback for subscription and unsubscription across all telcos goes to a queue (aggregator_subscription_feedback_queue) with a new param in the payload - "Network": "Airtel". Same goes for the billing queue (aggregator_billing_feedback_queue).

For a more indept description of this API, please check the wiki...


# NB
WHEN REGISTERING ANY ENDPOINT WITH MTN's SDP TAKE NOTE THAT THEY NETTED OUR IP TO A DIFFERENT IP ON THEIR END. SO FOR IT TO WORK USE THEIR NETTED IP NOT OURS

OUR IP = http://51.104.238.75
MTN's Netted equivalent = http://172.16.143.223

Example
http://51.104.238.75:9007/mtn/authorize_response === http://172.16.143.223:9007/mtn/authorize_response
         





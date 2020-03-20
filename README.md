## AGGREGATOR BILLING AND CHARGING API

Entities
- aggregator_platform (AG) : this calls our endpoints to subscribe users and bill
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
- Dont't forget to create a `.env` file, update it with the content of `.env.example` file in the project   directory.
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

sample subscription call - ```http://localhost:{{port}}/subscription/airtel/subscribe```

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
response goes here
```


**Unsubscription request**

Aggregator platform makes a unsubscription call to this API to unsubscribe for a product.

sample unsubscription call - ```http://localhost:{{port}}/subscription/airtel/unsubscribe```

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
response goes here
```

**Subscription status**

Aggregator platform makes a subscription call to this API to subscribe for a product.

***sample request***

```json
request goes here
```

***sample response***

```json
response goes here
```

**Postback call**

Postback feedback incoming from TELCO -Airtel

***sample request***

```xml
<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions targetNamespace="http://SubscriptionEngine.ibm.com" xmlns:impl="http://SubscriptionEngine.ibm.com" xmlns:intf="http://SubscriptionEngine.ibm.com" xmlns:tns2="http://dto.engine.subs.ibm.com" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:wsdlsoap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsi="http://ws-i.org/profiles/basic/1.1/xsd" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
 <wsdl:types>
  <schema targetNamespace="http://dto.engine.subs.ibm.com" xmlns="http://www.w3.org/2001/XMLSchema" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
   <complexType name="CPNotificationRespDTO">
    <sequence>
     <element name="xactionId" type="xsd:int"/>
     <element name="errorCode" type="xsd:int"/>
     <element name="errorMsg" nillable="true" type="xsd:string"/>
     <element name="temp1" nillable="true" type="xsd:string"/>
     <element name="temp2" nillable="true" type="xsd:string"/>
     <element name="temp3" nillable="true" type="xsd:string"/>
     <element name="lowBalance" type="xsd:double"/>
     <element name="amount" type="xsd:double"/>
     <element name="chargigTime" nillable="true" type="xsd:dateTime"/>
     <element name="msisdn" nillable="true" type="xsd:string"/>
     <element name="productId" type="xsd:int"/>
    </sequence>
   </complexType>
  </schema>
  <schema targetNamespace="http://SubscriptionEngine.ibm.com" xmlns="http://www.w3.org/2001/XMLSchema" xmlns:tns2="http://dto.engine.subs.ibm.com" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
   <import namespace="http://dto.engine.subs.ibm.com"/>
   <element name="notificationToCPResponse">
    <complexType>
     <sequence/>
    </complexType>
   </element>
   <element name="notificationToCP">
    <complexType>
     <sequence>
      <element name="notificationRespDTO" nillable="true" type="tns2:CPNotificationRespDTO"/>
     </sequence>
    </complexType>
   </element>
  </schema>
 </wsdl:types>

   <wsdl:message name="notificationToCPResponse">
     <wsdl:part element="intf:notificationToCPResponse" name="parameters"/>

  </wsdl:message>

   <wsdl:message name="notificationToCPRequest">
     <wsdl:part element="intf:notificationToCP" name="parameters"/>

  </wsdl:message>

   <wsdl:portType name="NotificationToCP">
     <wsdl:operation name="notificationToCP">
       <wsdl:input message="intf:notificationToCPRequest" name="notificationToCPRequest"/>

       <wsdl:output message="intf:notificationToCPResponse" name="notificationToCPResponse"/>

    </wsdl:operation>

  </wsdl:portType>

   <wsdl:binding name="NotificationToCPSoapBinding" type="intf:NotificationToCP">
 <wsaw:UsingAddressing wsdl:required="false" xmlns:wsaw="http://www.w3.org/2006/05/addressing/wsdl"/>

     <wsdlsoap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>

     <wsdl:operation name="notificationToCP">
       <wsdlsoap:operation soapAction="notificationToCP"/>

       <wsdl:input name="notificationToCPRequest">
         <wsdlsoap:body use="literal"/>

      </wsdl:input>

       <wsdl:output name="notificationToCPResponse">
         <wsdlsoap:body use="literal"/>

      </wsdl:output>

    </wsdl:operation>

  </wsdl:binding>

   <wsdl:service name="NotificationToCPService">
     <wsdl:port binding="intf:NotificationToCPSoapBinding" name="NotificationToCP">
       <wsdlsoap:address location="http://localhost:9080/SchedulingEngineWeb/services/NotificationToCP"/>

    </wsdl:port>

  </wsdl:service>

</wsdl:definitions>
```

***sample response***

```json
response goes here
```
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

sample subscription call - ```http://localhost:{{port}}/subscription/mtn/subscribe```

***sample request***

```json
{
	"msisdn": "2348066441262",
	"product_id": "wsdzfcszfedfafewa"
}
```

***sample response***

```json
response goes here
```


**Unsubscription request**

Aggregator platform makes a unsubscription call to this API to unsubscribe for a product.

sample unsubscription call - ```http://localhost:{{port}}/subscription/mtn/unsubscribe```

***sample request***

```json
{
	"msisdn": "2348066441262",
	"product_id": "wsdzfcszfedfafewa"
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
request goes here
```

***sample response***

```json
response goes here
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

#### Telco - 9Mobile

Name                                         | Endpoint
------------------------------------------- | -------------------------------------------
(**GET**) Base endpoint                             | /subscription
(**GET**) Base endpoint                             | /subscription
(**GET**) Base endpoint                             | /subscription

**Subscription request**

Aggregator platform makes a subscription call to this API to subscribe for a product.

sample subscription call - ```http://localhost:{{port}}/subscription/airtel/subscribe```

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
response goes here
```


**Unsubscription request**

Aggregator platform makes a unsubscription call to this API to unsubscribe for a product.

sample unsubscription call - ```http://localhost:{{port}}/subscription/airtel/unsubscribe```

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
response goes here
```

**Subscription status**

Aggregator platform makes a subscription call to this API to subscribe for a product.

***sample request***

```json
request goes here
```

***sample response***

```json
response goes here
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

9Mobile Flow
Action 1
    - AG calls "/nineMobile/subscribe" to initiate a subscription
        - we send out an sms MT to the user via the shortcode telling the user the keyword to reply with to start the process

    - 9Mobile calls "/nineMobile/sms/mo" with the message sent by the user to the shortcode and we reply by sending sms MT messages to the user. This process is iterrative till consent portion is done
        - once consent is done we make a sync call to 9mobile's subscription endpoint to subscribe user and then send the response we get to a queue (nineMobile_subscription_queue)
        - a consumer gets the response and sends to the ******aggregator_subscription_feedback_queue, adds a new param to the data which tells us if the send to the url was successful and then saves the data to DB

    - after AG gets their feedback on aggregator_subscription_feedback_url, they call our "/nineMobile/billing/sync" or "/nineMobile/billing/async" endpoint to charge user and then we call the 9mobile's charge endpoint
        - when using "/nineMobile/charge/sync", an immediate response is given to AG from response gotten from 9mobile
        - when using "/nineMobile/charge/async", we make the call and give AG an initial feedback
            - 9mobile calls our "/nineMobilePostBack" endpoint, we send the data to a queue(nineMobile_postback_queue)
            - a consumer gets the data from the queue and sends to the ******aggregator_billing_feedback_queue, adds a new param to the data which tells us if the send to the url was successful and then saves the data to DB


Airtel Flow

NB - All feedbacks for subscription across all telcos go to a queue(aggregator_subscription_feedback_queue) with a new param in data eg "telco : MTN"

same goes for billing queue (aggregator_billing_feedback_queue)
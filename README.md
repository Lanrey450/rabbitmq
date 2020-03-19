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

**(Alex Alex)** - <alex@terragonltd.com>

**(King Ariyo)** - <ariyo@terragonltd.com>

---

## Operating instruction
To start this software, run the first command below, and to run in development mode you can run the second command.

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

***sample request***

```json
request goes here
```

***sample response***

```json
response goes here
```


**Unsubscription request**

Aggregator platform makes a subscription call to this API to subscribe for a product.

***sample request***

```json
request goes here
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

Aggregator platform makes a subscription call to this API to subscribe for a product.

***sample request***

```json
request goes here
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

---

#### Telco - 9Mobile

Name                                         | Endpoint
------------------------------------------- | -------------------------------------------
(**GET**) Base endpoint                             | /subscription
(**GET**) Base endpoint                             | /subscription
(**GET**) Base endpoint                             | /subscription



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
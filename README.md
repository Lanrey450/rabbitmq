## AGGREGATOR BILLING AND CHARGING API

Entities
- aggregator_platform (AG) : this calls our endpoints to subscribe users and bill
- global_subscription_and_billing_engine (GSBE) : that is this application
- telcos (9mobile, Airtel and MTN)


9Mobile Flow
Action 1
    - AG calls "/nineMobile/subscribe" to initiate a subscription
        - we send out an sms MT to the user via the shortcode telling the user the keyword to reply with to start the process

    - 9Mobile calls "/nineMobile/sms/mo" with the message sent by the user to the shortcode and we reply by sending sms MT messages to the user. This process is iterrative till consent portion is done
        - once consent is done we make a sync call to 9mobile's subscription endpoint to subscribe user and then send the response we get to a queue (nineMobile_subscription_queue)
        - a consumer gets the response and sends to the nineMobile_aggregator_subscription_feedback_url, adds a new param to the data which tells us if the send to the url was successful and then saves the data to DB

    - after AG gets their feedback on aggregator_subscription_feedback_url, they call our "/nineMobile/charge/sync" or "/nineMobile/charge/async" endpoint to charge user and then we call the 9mobile's charge endpoint
        - when using "/nineMobile/charge/sync", an immediate response is given to AG from response gotten from 9mobile
        - when using "/nineMobile/charge/async", we make the call and give AG an initial feedback
            - 9mobile calls our "/nineMobilePostBack" endpoint, we send the data to a queue(nineMobile_postback_queue)
            - a consumer gets the data from the queue and sends to the nineMobile_aggregator_billing_feedback_url, adds a new param to the data which tells us if the send to the url was successful and then saves the data to DB


Airtel Flow

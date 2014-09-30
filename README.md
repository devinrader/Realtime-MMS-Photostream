# Realtime MMS Photostream

A real time gallery for messages sent with Twilio MMS.

## Installation

1. Clone this repo
2. Customize the index.html landing page, especially the portion that includes your phone number.
3. Deploy to Node PaaS or hosted environment of choice
4. Make sure to define these production environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_CALLER_ID
5. Set the Messaging Request URL for your Twilio MMS-enabled phone number to http://productiondomain/log

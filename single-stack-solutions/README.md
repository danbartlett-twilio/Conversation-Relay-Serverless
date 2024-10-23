## Single Stack Solutions

This folder contains multiple individually deployable stacks for specific use cases. 

The deployments should be very straightforward but the components are tightly coupled.

Use AWS Secrets Manager and create a secret for each stack you deploy that matches the stack name. For example, the restaurant-ordering stack is named "CR_RESTAURANT_ORDERING", so it requires a Secret named CR_RESTAURANT_ORDERING. The secrets require the following SecretStrings:

OPENAI_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
SENDGRID_API_KEY
TWILIO_EMAIL_FROM_ADDRESS

The first SecretString is required to access the LLM. The next two are required to send SMS messages and the final two are needed to send emails.
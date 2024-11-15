## 1. Configure AWS Secrets Manager
Use AWS Secrets Manager and create a secret for each stack you deploy that matches the stack name. For example, the restaurant-ordering stack is named "CR_MULTI_USE_CASE", so it requires a Secret named CR_MULTI_USE_CASE. The secrets require the following SecretStrings:

OPENAI_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
SENDGRID_API_KEY
TWILIO_EMAIL_FROM_ADDRESS

The first SecretString is required to access the LLM. The next two are required to send SMS messages and the final two are needed to send emails.

## 2. Deploy Cloud Formation Template
navigate to the multi-use-case directory
```bash
cd single-stack-solutions/multi-use-case
```

run sam build and deploy commands
```bash
chmod 755 build.sh 
./build.sh 
sam build
sam deploy --resolve-s3 --stack-name CR-MULTI-USE-CASE --template template.yaml --profile $(cat ../../aws-profile.profile) --capabilities CAPABILITY_NAMED_IAM
```

Now we will add the different use cases and profile to the dynamo DB. Before you run these commands update the `profile-example.js` file to contain your phone number and information.
```bash
aws dynamodb put-item --table-name CR-MULTI-USE-CASE-ConversationRelayAppDatabase --item "$(node ./configuration/dynamo-loaders/restaurantOrderingUseCase.js | cat)" --profile $(cat ../../aws-profile.profile)
aws dynamodb put-item --table-name CR-MULTI-USE-CASE-ConversationRelayAppDatabase --item "$(node ./configuration/dynamo-loaders/apartmentSearchUseCase.js | cat)" --profile $(cat ../../aws-profile.profile)
aws dynamodb put-item --table-name CR-MULTI-USE-CASE-ConversationRelayAppDatabase --item "$(node ./configuration/dynamo-loaders/apartmentData.js | cat)" --profile $(cat ../../aws-profile.profile)
aws dynamodb put-item --table-name CR-MULTI-USE-CASE-ConversationRelayAppDatabase --item "$(node ./configuration/dynamo-loaders/profile-example.js | cat)" --profile $(cat ../../aws-profile.profile)
```

Update your TwiML App with the new Voice URL replacing the SID with your TwiML App SID and the voice URL with the TwimlAPI output from the SAM deployment. 
```bash
twilio api:core:applications:update \
   --sid AP2a0747eba6abf96b7e3c3ff0b4530f6e \
   --voice-url https://f007d7xl7d.execute-api.us-east-1.amazonaws.com/call-setup-restaurant-ordering  
```

## 3. Deploy Visibility React App
- Copy the .env.example file to .env and add the following variables from the outputs of the Cloud Formation stack. 
```bash
cd visbility-app
cp .env.example .env
```

REACT_APP_UPDATE_USE_CASE_URL=
REACT_APP_GET_USE_CASE_URL=
REACT_APP_REGISTER_VOICE_CLIENT_URL=
REACT_APP_REFRESH_APARTMENTS_URL=

```bash
cd visibility-app
npm install
npm run build
node scripts/deploy.js
```

<<<<<<< Updated upstream
# Conversation Relay Serverless

Building production-quality voice AI agents is hard. In addition to building the agent logic, the key expectation when interacting with a voice AI agent is that it feels human-like. Conversation pacing, interruption handling, tone, and striking the right balance between listening/speaking are critical user experience elements that are difficult, but essential, to get right. Above all else, latency is the core problem to solve. 

Conversation Relay makes it easy to connect Twilio Voice to your AI assistant letting you focus on the behavior of the bot while Twilio handles the rest. 

This app serves as a reference for customers looking to build with VoxyRay. It shows best practices on how to connect to an AI assistant (in this is example it's ChatGPT but it could be any LLM) as well as tools that help you debug and monitor the performance.  

Features:
- 🏁 Returns responses with low latency, typically 1 second by utilizing streaming.
- ❗️ Allows the user to interrupt the GPT assistant and ask a different question.
- 📔 Maintains chat history with GPT.
- 🛠️ Allows the GPT to call external tools.

## Setting up for Development

### Prerequisites
Sign up for the following services and get an API key for each:
- [OpenAI](https://platform.openai.com/signup)
- [AWS Account](https://signin.aws.amazon.com/signup?request_type=register)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)


### 1. AWS CLI Setup
[Authenticate the CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)

```bash
aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```


### 2. Set the aws-profile
Profiles in the `~/.aws/credentials` file are enclosed in square brackets such as [default] or [user1]. 

Look in your `~/.aws/credentials` file and see what you profile is. 

Set that profile in your aws-profile.profile file. 

```bash
cat ~/.aws/credentials
[default]
....

echo 'default' > aws-profile.profile 
```

### 3. Install AWS SAM CLI
Install the necessary package from [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)


### 4. Deploy Cloud Formation Stack

#### 1. Dynamo DB Stack
Build the stack and then deploy it using the following commands:
```bash
cd 01_dynamodb/
sam build
sam deploy --guided --stack-name CONVERSATION-RELAY-DATABASE --template template.yaml --profile $(cat ../aws-profile.profile) 
```

Respond to the prompts as seen below:
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [CONVERSATION-RELAY-DATABASE]: 
        AWS Region [us-east-1]: 
        Parameter CurrentEnvironment [DEV]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: n
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]:
....

Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y 
```

You should see a successful output similar to below:
```bash
CloudFormation outputs from deployed stack
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Outputs                                                                                                                                                                    
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Key                 DynamonDBArn                                                                                                                                           
Description         -                                                                                                                                                      
Value               arn:aws:dynamodb:us-east-1:231521174640:table/ConversationRelayAppDatabase                                                                             

Key                 DynamonDBTableName                                                                                                                                     
Description         -                                                                                                                                                      
Value               ConversationRelayAppDatabase                                                                                                                           
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
```

#### 2. Conversation Relay Application Stack
Build the stack and then deploy it using the following commands:
```bash
cd ../02_cr-application
sam build
sam deploy --guided --stack-name CONVERSATION-RELAY-APPLICATION --template template.yaml --profile $(cat ../aws-profile.profile) --capabilities CAPABILITY_NAMED_IAM 
```

Respond to the prompts as seen below:
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [CONVERSATION-RELAY-APPLICATION]: 
        AWS Region [us-east-1]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: n
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: n

....

Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y
```

#### 3. TwiML API Stack
Build the stack and then deploy it using the following commands:
```bash
cd ../03_twiml-api/
sam build
sam deploy --guided --stack-name CONVERSATION-RELAY-TWIML-API --template template.yaml --profile $(cat ../aws-profile.profile) 
```

Respond to the questions as seen below:
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [CONVERSATION-RELAY-TWIML-API]: 
        AWS Region [us-east-1]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: N
        CallSetupFunction has no authentication. Is this okay? [y/N]: y
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: 
....

Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y
```

#### 4. Send Message Util
Build the stack and then deploy it using the following commands:
```bash
cd ../04_util-send-message 
sam build
sam deploy --guided --stack-name UTIL-SEND-MESSAGE --template template.yaml --profile $(cat ../aws-profile.profile) --capabilities CAPABILITY_NAMED_IAM 
```

Respond to the questions as seen below:
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [UTIL-SEND-MESSAGE]: 
        AWS Region [us-east-1]: 
        Parameter ConversationRelayTwilioClientLayerVersion [1]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: n
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: 
....

Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y
```

#### 5. Default Use Case
Build the stack and then deploy it using the following commands:
```bash
cd ../05_use-case-default
sam build
sam deploy --guided --stack-name USE-CASE-DEFAULT --template template.yaml --profile $(cat ../aws-profile.profile) --capabilities CAPABILITY_NAMED_IAM 
```

Respond to the questions as seen below:
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [USE-CASE-DEFAULT]: 
        AWS Region [us-east-1]: 
        Parameter ConversationRelayDynamoDBUtilLayerVersion [1]: 
        Parameter ConversationRelaySaveToolCallResultLayerVersion [1]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: n
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: 
....

Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y
```

#### 6. Apartment Search Use Case
Build the stack and then deploy it using the following commands:
```bash
cd ../06_use-case-apartment-search
sam build
sam deploy --guided --stack-name USE-CASE-DEFAULT --template template.yaml --profile $(cat ../aws-profile.profile) --capabilities CAPABILITY_NAMED_IAM 
```

Respond to the questions as seen below:
```bash
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Not found

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [USE-CASE-APT-SEARCH]: 
        AWS Region [us-east-1]: 
        Parameter ConversationRelayRandomDataGeneratorLayerVersion [1]: 
        Parameter ConversationRelaySaveToolCallResultLayerVersion [1]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [y/N]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: n
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: 
....

Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y
```

## Application Workflow
Conversation Relay coordinates the data flow between text to speech and ASR providers an communicates bi-directional with your app through websockets:
![Conversation RelayBYOT](https://github.com/user-attachments/assets/76440ba2-dfb3-4ea0-b558-1fe1dd925a20)

=======
ConversationRelayPrgDanBartlett
>>>>>>> Stashed changes

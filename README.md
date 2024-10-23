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


### 4. From here, decide if you want to deploy the decoupled-architecture or a single use case from the single-stack-solutions.
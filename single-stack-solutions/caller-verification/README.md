# Caller Verification Solution

This is a serverless solution for caller identity verification using voice conversations. It provides a natural, conversational interface for verifying caller identity through a combination of personal information verification and SMS-based code verification.

## Features

- Natural language conversation for caller verification
- Integration with DynamoDB for customer data lookup
- SMS-based verification code system
- Seamless handoff to live agents
- WebSocket-based real-time communication
- TwiML-based voice response system

## Prerequisites

Before deploying this solution, you need:

1. AWS Account with appropriate permissions
2. AWS SAM CLI installed
3. Node.js 18.x or later
4. A secret in AWS Secrets Manager named "CR_CALLER_VERIFICATION" containing:
   - OPENAI_API_KEY
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - SENDGRID_API_KEY
   - TWILIO_EMAIL_FROM_ADDRESS

## Deployment

Deploy the stack using SAM:
```bash
sam build
sam deploy --guided
```

During the guided deployment, you'll need to provide:
- Stack name (e.g., cr-caller-verification)
- AWS Region
- Environment (dev/prod)
- DynamoDB table name
- OpenAI API Key
- Twilio Account SID
- Twilio Auth Token

## Conversation Context and Tools

The AI's behavior and available tools are defined in `configuration/dynamo-item.json`. This file contains:

1. **Conversation Context**: The `prompt` field defines:
   - AI's persona (Joules, an Energy company phone operator)
   - Style guidelines for responses
   - Specific instructions for handling verification
   - Step-by-step validation process

2. **Available Tools**: The `tools` array defines functions the AI can use:
   - get-customer: Retrieves customer details
   - verify-send: Sends verification codes
   - verify-code: Validates codes
   - live-agent-handoff: Transfers to human agents

### Modifying the Context

To modify how the AI behaves:

1. Edit `configuration/dynamo-item.json`:
   ```json
   {
     "prompt": "# Objective\nYour name is [NAME] and you are...",
     "tools": [
       // Tool definitions
     ]
   }
   ```

2. Common modifications:
   - Change the AI's name and role
   - Modify verification steps
   - Add or remove style guidelines
   - Adjust response patterns
   - Update validation requirements

3. After modifying:
   - Redeploy the stack to update DynamoDB
   - Or manually update the DynamoDB item with key:
     - pk: "USE_CASE#CR_CALLER_VERIFICATION"
     - sk: "CONFIG#LATEST"

### Adding/Modifying Tools

To add or modify available tools:

1. Add the tool definition in `dynamo-item.json`:
   ```json
   {
     "type": "function",
     "function": {
       "name": "new-tool-name",
       "description": "What the tool does",
       "parameters": {
         "type": "object",
         "properties": {
           "param1": {
             "type": "string",
             "description": "Parameter description"
           }
         },
         "required": ["param1"]
       }
     }
   }
   ```

2. Implement the corresponding Lambda function in `lambdas/util/`
3. Add the function to `template.yaml` with appropriate layers
4. Update `function-manifest.js` to include the new function

## Architecture

The solution consists of several components:

1. **TwiML Endpoint**: Handles incoming calls and sets up the voice stream
2. **WebSocket API**: Manages real-time communication for voice processing
3. **Utility Functions**: Handle specific tasks like verification
4. **DynamoDB**: Stores configuration, customer data, and call metadata

## Shared Layers

The solution uses the following shared layers:
- layer-cr-dynamodb-util: DynamoDB utility functions
- layer-cr-open-ai-client: OpenAI integration
- layer-cr-twilio-client: Twilio integration
- layer-save-tool-result: Tool result handling

## Monitoring

The solution logs all interactions to CloudWatch Logs. Each function has its own log group following the pattern:
- /aws/lambda/cr-caller-verification-{function-name}

## Security

- All sensitive information is stored in AWS Secrets Manager
- Communication is encrypted in transit
- DynamoDB encryption at rest is enabled by default
- IAM roles follow the principle of least privilege

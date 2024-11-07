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

The solution uses two main configuration files that work together:

### 1. DynamoDB Item (configuration/dynamo-item.json)

This file defines what the AI can do and how it behaves:

```json
{
  "prompt": "# Objective\nYour name is Joules...",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get-customer",
        "description": "Retrieves customer details...",
        "parameters": {
          // Parameter definitions
        }
      }
    }
    // More tools...
  ]
}
```

### 2. Function Manifest (configuration/function-manifest.js)

This file maps the tools to their Lambda function implementations:

```javascript
module.exports = {
    functions: {
        'get-customer': {
            description: 'Retrieves customer details based on phone number',
            handler: 'util/get-customer/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE
            }
        },
        'verify-send': {
            description: 'Sends verification code via SMS',
            handler: 'util/verify-send/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
                TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
                TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN
            }
        }
        // More function definitions...
    },
    layers: [
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-cr-dynamodb-util:latest',
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-cr-open-ai-client:latest',
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-cr-twilio-client:latest',
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-save-tool-result:latest'
    ]
}
```

### Adding New Tools

To add a new tool:

1. Add the tool definition to `dynamo-item.json`:
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

2. Add the function implementation to `function-manifest.js`:
```javascript
'new-tool-name': {
    description: 'Tool description',
    handler: 'util/new-tool-name/app.handler',
    memorySize: 256,
    timeout: 30,
    environment: {
        DYNAMODB_TABLE: process.env.DYNAMODB_TABLE
        // Add any other required environment variables
    }
}
```

3. Create the Lambda function implementation in `lambdas/util/new-tool-name/app.mjs`

4. Update the prompt in `dynamo-item.json` to instruct the AI how to use the new tool

### Modifying Existing Tools

To modify an existing tool:

1. Update the tool definition in `dynamo-item.json` if changing parameters or behavior
2. Update the function configuration in `function-manifest.js` if changing runtime settings
3. Modify the Lambda function implementation if changing functionality
4. Update the prompt in `dynamo-item.json` if the tool's usage instructions need to change

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

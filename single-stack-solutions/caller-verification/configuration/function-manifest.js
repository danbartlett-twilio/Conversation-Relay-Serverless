module.exports = {
    functions: {
        // TwiML Functions
        'twiml-call-setup': {
            description: 'Handles initial call setup and TwiML generation',
            handler: 'twiml/call-setup/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
                WEBSOCKET_API: process.env.WEBSOCKET_API,
                USE_CASE: 'CR_CALLER_VERIFICATION'
            }
        },

        // WebSocket Functions
        'ws-connect': {
            description: 'Handles WebSocket connect events',
            handler: 'websocket/connect/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE
            }
        },
        'ws-disconnect': {
            description: 'Handles WebSocket disconnect events',
            handler: 'websocket/disconnect/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE
            }
        },
        'ws-default': {
            description: 'Handles WebSocket default events',
            handler: 'websocket/default/app.handler',
            memorySize: 1024,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
                OPENAI_API_KEY: process.env.OPENAI_API_KEY
            }
        },

        // Utility Functions
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
        },
        'verify-code': {
            description: 'Verifies the code provided by the customer',
            handler: 'util/verify-code/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE
            }
        },
        'live-agent-handoff': {
            description: 'Handles transferring call to a live agent',
            handler: 'util/live-agent-handoff/app.handler',
            memorySize: 256,
            timeout: 30,
            environment: {
                DYNAMODB_TABLE: process.env.DYNAMODB_TABLE
            }
        }
    },
    layers: [
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-cr-dynamodb-util:latest',
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-cr-open-ai-client:latest',
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-cr-twilio-client:latest',
        'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:layer-save-tool-result:latest'
    ]
};

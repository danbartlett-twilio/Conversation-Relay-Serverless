import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event) => {
    try {
        const { callSid } = JSON.parse(event.body);

        if (!callSid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Call SID is required' })
            };
        }

        // Update call status in DynamoDB
        await ddbDocClient.update({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `CALL#${callSid}`,
                sk: 'METADATA'
            },
            UpdateExpression: 'SET #status = :status, handoffTime = :time',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'TRANSFERRED',
                ':time': new Date().toISOString()
            }
        });

        // Create TwiML for transferring to agent
        const twiml = new VoiceResponse();
        
        // Add a brief message before transfer
        twiml.say({
            voice: 'Polly.Amy-Neural',
            language: 'en-GB'
        }, 'Transferring you to an Energy Specialist now.');

        // Add a pause for natural conversation flow
        twiml.pause({ length: 1 });

        // Redirect to agent queue or specific number
        // Note: Replace with actual agent transfer endpoint or phone number
        twiml.dial({
            answerOnBridge: true
        }, '+1234567890'); // Replace with actual agent number or queue

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml'
            },
            body: twiml.toString()
        };
    } catch (error) {
        console.error('Error in agent handoff:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

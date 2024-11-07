import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event) => {
    try {
        // Parse the incoming request body
        const body = event.body ? 
            (typeof event.body === 'string' ? 
                Object.fromEntries(new URLSearchParams(event.body)) : 
                event.body) : 
            {};

        const callSid = body.CallSid;
        const from = body.From;

        // Create a new TwiML response
        const twiml = new VoiceResponse();

        // Add initial pause for natural conversation flow
        twiml.pause({ length: 1 });

        // Start the conversation with websocket connection
        twiml.connect()
            .stream({
                url: `${process.env.WEBSOCKET_API}?callSid=${callSid}`,
                track: 'inbound_track'
            });

        // Add the media stream for bi-directional audio
        twiml.start()
            .stream({
                url: `${process.env.WEBSOCKET_API}?callSid=${callSid}`,
                track: 'outbound_track',
                name: 'stream_customer'
            });

        // Store call details in DynamoDB
        await ddbDocClient.put({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                pk: `CALL#${callSid}`,
                sk: 'METADATA',
                type: 'CALL_METADATA',
                callSid,
                from,
                useCase: process.env.USE_CASE,
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            }
        });

        // Return the TwiML response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml'
            },
            body: twiml.toString()
        };
    } catch (error) {
        console.error('Error in call setup:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

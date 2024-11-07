import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        const callSid = event.queryStringParameters?.callSid;

        if (!callSid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'CallSid is required' })
            };
        }

        // Store the WebSocket connection details
        await ddbDocClient.put({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                pk: `CONNECTION#${connectionId}`,
                sk: 'METADATA',
                type: 'WEBSOCKET_CONNECTION',
                connectionId,
                callSid,
                status: 'CONNECTED',
                createdAt: new Date().toISOString()
            }
        });

        // Create a reverse lookup for CallSid to ConnectionId
        await ddbDocClient.put({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                pk: `CALL#${callSid}`,
                sk: `CONNECTION#${connectionId}`,
                type: 'CALL_CONNECTION',
                connectionId,
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Connected' })
        };
    } catch (error) {
        console.error('Error in WebSocket connect:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to connect' })
        };
    }
};

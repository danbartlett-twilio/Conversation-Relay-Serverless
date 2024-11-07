import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;

        // Get connection details to find associated callSid
        const connectionResult = await ddbDocClient.get({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `CONNECTION#${connectionId}`,
                sk: 'METADATA'
            }
        });

        if (connectionResult.Item) {
            const callSid = connectionResult.Item.callSid;

            // Delete the call connection mapping
            await ddbDocClient.delete({
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    pk: `CALL#${callSid}`,
                    sk: `CONNECTION#${connectionId}`
                }
            });

            // Update call status
            await ddbDocClient.update({
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    pk: `CALL#${callSid}`,
                    sk: 'METADATA'
                },
                UpdateExpression: 'SET #status = :status, disconnectedAt = :time',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':status': 'DISCONNECTED',
                    ':time': new Date().toISOString()
                }
            });
        }

        // Delete the connection record
        await ddbDocClient.delete({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `CONNECTION#${connectionId}`,
                sk: 'METADATA'
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Disconnected' })
        };
    } catch (error) {
        console.error('Error in WebSocket disconnect:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to disconnect properly' })
        };
    }
};

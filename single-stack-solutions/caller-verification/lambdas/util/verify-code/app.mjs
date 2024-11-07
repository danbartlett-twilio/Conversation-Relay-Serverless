import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event) => {
    try {
        const { code, from } = JSON.parse(event.body);

        if (!code || !from) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Verification code and phone number are required' })
            };
        }

        // Get the stored verification code from DynamoDB
        const result = await ddbDocClient.get({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `VERIFICATION#${from}`,
                sk: 'CODE'
            }
        });

        if (!result.Item) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    verified: false,
                    error: 'No verification code found. Please request a new code.' 
                })
            };
        }

        const storedCode = result.Item.code;
        const expiresAt = new Date(result.Item.expiresAt);
        const now = new Date();

        // Check if code has expired
        if (now > expiresAt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    verified: false,
                    error: 'Verification code has expired. Please request a new code.' 
                })
            };
        }

        // Verify the code
        const isValid = code === storedCode;

        // If code is valid, delete it from DynamoDB to prevent reuse
        if (isValid) {
            await ddbDocClient.delete({
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    pk: `VERIFICATION#${from}`,
                    sk: 'CODE'
                }
            });

            // Store verification status
            await ddbDocClient.put({
                TableName: process.env.DYNAMODB_TABLE,
                Item: {
                    pk: `VERIFICATION#${from}`,
                    sk: 'STATUS',
                    status: 'VERIFIED',
                    verifiedAt: now.toISOString()
                }
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                verified: isValid,
                message: isValid ? 'Verification successful' : 'Invalid verification code'
            })
        };
    } catch (error) {
        console.error('Error verifying code:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

export const handler = async (event) => {
    try {
        const { from } = JSON.parse(event.body);

        if (!from) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Phone number is required' })
            };
        }

        // Query DynamoDB for customer details
        const result = await ddbDocClient.query({
            TableName: process.env.DYNAMODB_TABLE,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': `CUSTOMER#${from}`
            }
        });

        // If customer not found, return mock data for demo purposes
        if (!result.Items || result.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneNumber: from,
                    email: 'john.doe@example.com',
                    // Add any other mock customer details needed for testing
                })
            };
        }

        // Return the found customer details
        const customer = result.Items[0];
        return {
            statusCode: 200,
            body: JSON.stringify({
                firstName: customer.firstName,
                lastName: customer.lastName,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                // Add any other customer details needed
            })
        };
    } catch (error) {
        console.error('Error getting customer details:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

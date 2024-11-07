import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import twilio from 'twilio';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const handler = async (event) => {
    try {
        const { from } = JSON.parse(event.body);

        if (!from) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Phone number is required' })
            };
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const expirationTime = new Date(Date.now() + 5 * 60000); // 5 minutes from now

        // Store verification code in DynamoDB
        await ddbDocClient.put({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                pk: `VERIFICATION#${from}`,
                sk: 'CODE',
                code: verificationCode,
                expiresAt: expirationTime.toISOString(),
                createdAt: new Date().toISOString()
            }
        });

        // Send verification code via SMS
        await twilioClient.messages.create({
            body: `Your verification code is: ${verificationCode}. This code will expire in 5 minutes.`,
            to: from,
            from: process.env.TWILIO_PHONE_NUMBER // Make sure this is set in environment variables
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Verification code sent successfully',
                phoneNumber: from
            })
        };
    } catch (error) {
        console.error('Error sending verification code:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

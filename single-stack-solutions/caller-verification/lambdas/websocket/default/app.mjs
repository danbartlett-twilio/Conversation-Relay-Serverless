import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { Configuration, OpenAIApi } from 'openai';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

// Initialize OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const handler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;

        // Initialize API Gateway Management API client
        const apiGateway = new ApiGatewayManagementApiClient({
            endpoint: `https://${domain}/${stage}`
        });

        // Get connection details
        const connectionResult = await ddbDocClient.get({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: `CONNECTION#${connectionId}`,
                sk: 'METADATA'
            }
        });

        if (!connectionResult.Item) {
            return { statusCode: 400, body: 'Connection not found' };
        }

        const callSid = connectionResult.Item.callSid;

        // Get use case configuration
        const useCaseResult = await ddbDocClient.get({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                pk: 'USE_CASE#CR_CALLER_VERIFICATION',
                sk: 'CONFIG#LATEST'
            }
        });

        if (!useCaseResult.Item) {
            return { statusCode: 400, body: 'Use case configuration not found' };
        }

        const useCase = useCaseResult.Item;

        // Parse the incoming message
        const body = JSON.parse(event.body);
        const transcript = body.transcript || '';
        const media = body.media || {};

        // Store the transcript
        await ddbDocClient.put({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                pk: `CALL#${callSid}`,
                sk: `TRANSCRIPT#${Date.now()}`,
                type: 'TRANSCRIPT',
                text: transcript,
                role: 'user',
                createdAt: new Date().toISOString()
            }
        });

        // Get conversation history
        const historyResult = await ddbDocClient.query({
            TableName: process.env.DYNAMODB_TABLE,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': `CALL#${callSid}`,
                ':sk': 'TRANSCRIPT#'
            },
            Limit: 10,
            ScanIndexForward: false
        });

        // Format conversation history for OpenAI
        const messages = historyResult.Items
            ? historyResult.Items.reverse().map(item => ({
                role: item.role,
                content: item.text
            }))
            : [];

        // Add system message with use case configuration
        messages.unshift({
            role: 'system',
            content: useCase.prompt
        });

        // Get response from OpenAI
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages,
            temperature: 0.7,
            max_tokens: 150
        });

        const assistantResponse = completion.data.choices[0].message.content;

        // Store assistant's response
        await ddbDocClient.put({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                pk: `CALL#${callSid}`,
                sk: `TRANSCRIPT#${Date.now()}`,
                type: 'TRANSCRIPT',
                text: assistantResponse,
                role: 'assistant',
                createdAt: new Date().toISOString()
            }
        });

        // Send response back through WebSocket
        await apiGateway.send(new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({
                type: 'response',
                text: assistantResponse
            })
        }));

        return { statusCode: 200, body: 'Message processed' };
    } catch (error) {
        console.error('Error in WebSocket default handler:', error);
        return { statusCode: 500, body: 'Internal server error' };
    }
};

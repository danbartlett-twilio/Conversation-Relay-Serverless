/**
 *  onconnect
 * 
 * Lambda function called when a new WebSocket connection has
 * been established. The requestId passed as a queryStringParameter
 * is used to fetch the records made when the session was started
 * via Twiml and then make copies using the WebSocket ConnectionId.
 * The WebSocket ConnectionId is available for every message sent
 * from Twilio for this session so is used to maintain state.
 * 
 * This lambda links the Twiml session established initial with
 * the Websocket session created by ConversationRelay.
 *  
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));    

    /**
     * 1) Pull setup record from dynamodb using event.queryStringParameters.cid
     * 2) Create new record using event.requestContext.connectionId
     */

    try {

        // 1) Pull setup record from dynamodb using event.queryStringParameters.cid
        // cid is the requestID from the initial setup         
        const initialItems = await ddbDocClient.send(new QueryCommand( {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "#pk = :pk", 
            ExpressionAttributeNames: { '#pk': 'pk' }, 
            ExpressionAttributeValues: { ':pk': event.queryStringParameters.cid } 
        } ) );

        if (!initialItems.Items.length === 0) {
            
            console.log("==> Could not find initial items...");
            return false;

        } else {
            
            // Make a copies of the items but replacing the pk
            // with the WebSocket ConnectionId
            const putRequests = initialItems.Items.map(obj => {                
                return { 
                    PutRequest: {
                        Item: {
                            ...obj, 
                            pk: event.requestContext.connectionId,
                            pk1: "connection",
                            sk1: obj.From,
                            createdAt: parseInt((Date.now()),
                            expireAt:  parseInt((Date.now() / 1000) + 86400)  // Expire "demo" session data automatically (can be removed)
                        }
                    }
                }; 
            });            

            // Persits items to the database
            await ddbDocClient.send(new BatchWriteCommand({ RequestItems: { [process.env.TABLE_NAME]:putRequests } }));                        

            return { statusCode: 200, body: 'Success.' };
        }

    } catch (error) {
        
        console.log("Error failed to connect => ", error);
        
        return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };

    }    

};
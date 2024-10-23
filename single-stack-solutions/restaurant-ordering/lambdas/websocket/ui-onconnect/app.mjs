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
 * This lambda links all the UI sessions established to the CR connection
 *  
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {

    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));

    return { statusCode: 200, body: 'Success.' };

};
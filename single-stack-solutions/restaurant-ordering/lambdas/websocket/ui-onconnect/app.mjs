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

// Import the AWS SDK for JavaScript v2
import AWS from 'aws-sdk';

// Set the AWS Region
const REGION = process.env.AWS_REGION
// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient({ region: REGION });
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
// const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {

    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));
    let connectionId = event.requestContext.connectionId;
    let ws_domain_name = event.requestContext.domainName;
    let ws_stage = event.requestContext.stage;

    // const params = {
    //     TableName: process.env.TABLE_NAME,
    //     FilterExpression: '#sk = :skVal and #sid = :sid',
    //     ExpressionAttributeNames: {
    //         '#sk': 'sk',
    //         '#sid': 'CallSid'
    //     },
    //     ExpressionAttributeValues: {
    //         ':skVal': 'finalConnection',
    //         ':sid': event.queryStringParameters.phoneNum
    //     },
    //     // ProjectionExpression: "Caller, #Called, CallSid, expireAt"
    // };

    try {
        // const data = await ddb.scan(params).promise();
        // console.log('Success', data.Items);
        // let connectionItem = data.Items[0];
        // let phoneNum = event.queryStringParameters.phoneNum;
        // let putItem = {
        //     pk: (phoneNum.indexOf('+') >= 0) ? phoneNum : ("+" + phoneNum.trim()),
        //     sk: 'uiConnection',
        //     'uiConnId': connectionId,
        //     'domain': ws_domain_name,
        //     'stage':ws_stage
        // }

        // console.log("put Item: " + JSON.stringify(putItem));
        // await ddbDocClient.send(
        //     new PutCommand({
        //         TableName: process.env.TABLE_NAME,
        //         Item: putItem
        //     })
        // );

        return { statusCode: 200, body: "Success." };
    } catch (err) {
        console.error('Error', err);
        return { statusCode: 500, body: JSON.stringify(err) };
    }
};
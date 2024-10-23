/**
 *  onconnect
 * 
 * Lambda function subscribed to SNS Topic. Receives
 * new messages, parses the message body, and then
 * saves to DynamoDB Table. primary key / sort key follows pattern:
 * pk: MessageSid, sk: MessageStatus
 */

//import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
//import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    //const client = new DynamoDBClient({ region: process.env.REGION });
    //const ddbDocClient = DynamoDBDocumentClient.from(client);               

    // Set primary key as connectionId
    // Set sort key as string "connectionId"
    /*
    const key = {
        pk: event.requestContext.connectionId,
        sk: "connectionId",
    }; 
    */
    try {
        
        /*
        const data = await ddbDocClient.send(
            new DeleteCommand({
              TableName: process.env.TABLE_NAME,
              Key: key,
            })
        );
        */
        //console.log("Successfully saved object to DynamoDB Table! Data => ", data);
        
        return { statusCode: 200, body: 'Deleted.' };

    } catch (error) {
        
        console.log("Error failed to delete => ", error);
        
        return { statusCode: 500, body: 'Failed to delete: ' + JSON.stringify(err) };

    }    

};
/**
 *  DefaultSaveFirstAndLastName
 * 
 * Simple sample function for tool call
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function save the user's full
async function saveName(args, evt) {

  await ddbDocClient.send(
    new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
            pk: evt.call_details.from_phone,
            sk: "profile",
            pk1: "profile",
            sk1: evt.call_details.from_phone,
            firstName: args.firstName,
            lastName: args.lastName,
            useCase: "defaultUseCase"         
        }
    })
  );  

  return {  
    message: "Name saved."
  };

}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {
        
        let args = JSON.parse(event.function.arguments);

        let toolResult = await saveName(args, event);

        await saveToolResult(ddbDocClient, event, toolResult);
        
        return { 
            ws_connectionId: event.ws_connectionId, 
            ws_domain_name: event.ws_domain_name,
            ws_stage: event.ws_stage,
            tool_call_id: event.id 
        };

    } catch (error) {
        
        console.log("Error failed to complete the function => ", error);
        
        return { statusCode: 500, body: 'Failed to complete: ' + JSON.stringify(error) };

    }    

};
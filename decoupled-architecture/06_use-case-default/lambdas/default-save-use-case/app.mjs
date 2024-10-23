/**
 *  DefaultSaveUseCase
 * 
 * Simple sample function for tool call
 */
import { buildDynExpressions }  from "/opt/cr-dynamodb-util.mjs";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to handle common inquiries
async function saveUseCase(args, evt) {

    // UPDATE VERIFICATION RECORD
    let exps = await buildDynExpressions( { useCase: args.useCase } );        

    console.log("exps ==> ", exps);

    await ddbDocClient.send( 
        new UpdateCommand(
            { 
                TableName: process.env.TABLE_NAME, Key: { pk: evt.call_details.from_phone, sk: "profile" }, 
                UpdateExpression: exps.updateExpression,
                ExpressionAttributeNames: exps.expressionAttributeNames,        
                ExpressionAttributeValues: exps.expressionAttributeValues,
                ReturnValues: "ALL_NEW",                            
            } 
        ) 
    );       

    return {  
        message: "Use Case saved!"
    };

}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {

        let args = JSON.parse(event.function.arguments);

        let toolResult = await saveUseCase(args, event);

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
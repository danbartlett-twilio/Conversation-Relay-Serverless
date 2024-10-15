/**
 *  PlaceOrderFunction
 * 
 * Simple sample function for tool call
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
async function checkPickUpTime(args, evt) {

  console.info("args\n" + JSON.stringify(args, null, 2));  

  let pickupTimes = [
    {time: "15 minutes", message:"We are starting your order right now! See you in 15 minutes."},
    {time: "30 minutes", message:"We will your order ready in 30 minutes."},
    {time: "45 minutes", message:"We are a little backed up right now so you order will be ready in 45 minutes."}
  ];

  let pickupTime = pickupTimes[ ( Math.floor (Math.random() * pickupTimes.length) ) ];

  // Return confirmation message for the successful scheduling

  return {
      pickupTime: pickupTime.time,
      message: pickupTime.time
  };

}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {

        let args = JSON.parse(event.function.arguments);

        let toolResult = await checkPickUpTime(args, event);

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
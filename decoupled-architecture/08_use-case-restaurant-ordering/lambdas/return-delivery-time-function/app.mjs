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
async function checkDeliveryTime(args, evt) {

  console.info("args\n" + JSON.stringify(args, null, 2));  

  let deliveryTimes = [
    {time: "45 minutes", message:"We are starting your order right now and can have it to you in 45."},
    {time: "1 hour", message:"We will deliver your order in one hour."},
    {time: "1 hour and 15 minutes", message:"We are a little backed up right now so we will delivery your order in one hour and 15 minutes."}
  ];

  let deliveryTime = deliveryTimes[ ( Math.floor (Math.random() * deliveryTimes.length) ) ];

  // Return confirmation message for the successful scheduling

  return {
      deliveryTime: deliveryTime.time,
      message: deliveryTime.time
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
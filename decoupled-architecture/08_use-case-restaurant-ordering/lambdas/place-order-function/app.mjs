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
async function placeOrder(args, evt) {

  console.info("args\n" + JSON.stringify(args, null, 2));  

  // Create an order id based on the websocket connection id
  // so that this order can be easily pulled up later in this session
  // using "begins_with".
  let order_sk = `restaurantOrder::${evt.ws_connectionId.slice(-4)}::${(Math.floor(Date.now() / 1000)).toString()}`;
  console.log("order_sk ==> ", order_sk);

  // Save new appointment linked to the user to the database              
  let confirmedOrder = {
    pk: evt.userContext.pk,
    sk: order_sk,
    pk1: 'restaurantOrder', 
    sk1: evt.userContext.pk,
    order: {
      order_items: args.current_order,
      order_type: args.order_type,
      order_total: args.order_total
    },
    expireAt:  parseInt((Date.now() / 1000) + (86400 * 7))  // Expire "demo" session data automatically (can be removed)
  };
  
  await ddbDocClient.send(
    new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: confirmedOrder
  }));  

  console.log(`[PlaceOrderFunction] Order successfully saved.`);

  // Return confirmation message for the successful scheduling
  return {
    available: true,
    message: `Your order has been accepted. Would you like a confirmation via SMS?`,
  };
}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {

        let args = JSON.parse(event.function.arguments);

        let toolResult = await placeOrder(args, event);

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
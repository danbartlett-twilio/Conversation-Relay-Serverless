/**
 *  PlaceOrderFunction
 * 
 * Simple sample function for tool call
 */

import { PutCommand } from "@aws-sdk/lib-dynamodb";   

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
export async function PlaceOrderFunction(ddbDocClient, tool) {

  console.info("in PlaceOrderFunction and tool\n" + JSON.stringify(tool, null, 2));    

  let args = JSON.parse(tool.function.arguments);

  console.info("args\n" + JSON.stringify(args, null, 2));  

  // Create an order id based on the websocket connection id
  // so that this order can be easily pulled up later in this session
  // using "begins_with".
  let order_sk = `restaurantOrder::${tool.ws_connectionId.slice(-4)}::${(Math.floor(Date.now() / 1000)).toString()}`;
  console.log("order_sk ==> ", order_sk);

  // Save new appointment linked to the user to the database              
  let confirmedOrder = {
    pk: tool.userContext.pk,
    sk: order_sk,
    pk1: 'restaurantOrder', 
    sk1: tool.userContext.pk,
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

  let toolResult = { message: `Your order has been accepted. Would you like a confirmation via SMS?`};

  await saveToolResult(ddbDocClient, tool, toolResult);

  return true;
}
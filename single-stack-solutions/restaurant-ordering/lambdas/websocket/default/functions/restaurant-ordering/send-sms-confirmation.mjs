/**
 *  SendRestaurantSmsFunction
 * 
 * Function publishes an SNS message to generate
 * an event which calls another lambda to send an 
 * SMS message.
 */

import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import  { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

import { saveToolResult }  from "/opt/save-tool-result.mjs";

async function sendMessage(ddbDocClient, tool) {

  // GET the completed order
  const ordersRaw = await ddbDocClient.send(new QueryCommand({ 
    TableName: process.env.TABLE_NAME, 
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)", 
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' }, 
    ExpressionAttributeValues: { ':pk': tool.userContext.pk, ':sk': `restaurantOrder::${tool.ws_connectionId.slice(-4)}::` } } )); 

  const current_order = ordersRaw.Items[0];    
  const order_items_text = current_order.order.order_items.map( it => {
    return  it.line_item;
  });

  // Personalize the message using the userProfile
  const name = tool.userContext?.firstName || "friend";
  const message = `Hi ${name}, Twilio Dough Boys has accepted your order [${order_items_text.join(', ')}]. The total is $${current_order.order.order_total} due on ${current_order.order.order_type}.`;

  if (current_order.order.order_type === "delivery" && current_order.order?.delivery_address) {
    message = message + ` This order will be delivered to ${current_order.order.delivery_address}.`
  }

  let snsPayload = {
    MessageBody: message,
    From: tool.call_details.to_phone, // The "to" is the Twilio number (sender)
    To: tool.call_details.from_phone // The "from" is the user's phone number (recipient)
  };
  
  let snsResult = await snsClient.send(new PublishCommand({
    Message: JSON.stringify(snsPayload),
    TopicArn: process.env.TWILIO_SEND_MESSAGE_TOPIC_ARN
  }));  

  console.log(`[SendOrderConfirmationMessage] SMS sent successfully: ${snsResult}`);

  return {
    status: "success",
    message: `An SMS confirmation has been sent.`,
  };
  
}

// Function to schedule a tour
export async function SendRestaurantSmsFunction(ddbDocClient, tool) {

    console.info("in SendRestaurantSmsFunction and tool\n" + JSON.stringify(tool, null, 2));

    let toolResult = await sendMessage(ddbDocClient, tool);
    
    await saveToolResult(ddbDocClient, tool, toolResult);

    return true;

}
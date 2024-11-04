/**
 *  SendRestaurantEmailFunction
 * 
 * Function publishes an SNS message to generate
 * an event which calls another lambda to send an email.
 */

import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import  { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

import { saveToolResult }  from "/opt/save-tool-result.mjs";

async function sendEmail(ddbDocClient, tool) {

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
  const message = `<b>Hi ${name}, Twilio Dough Boys has accepted your order [${order_items_text.join(', ')}]. The total is $${current_order.order.order_total} due on ${current_order.order.order_type}.</b>`;

  if (current_order.order.order_type === "delivery" && current_order.order?.delivery_address) {
    message = message + ` This order will be delivered to ${current_order.order.delivery_address}.`
  }

  let snsPayload = {
    html: message,
    to_email: tool.userContext.email,
    to_name: tool.userContext.firstName,
    subject: `Your Twilio Dough Boys Order! ${tool.ws_connectionId.slice(-4)}`,
    html: message
  };

  let snsResult = await snsClient.send(new PublishCommand({
    Message: JSON.stringify(snsPayload),
    TopicArn: process.env.TWILIO_SEND_EMAIL_TOPIC_ARN
  }));  
  
  console.log(`[SendOrderConfirmationMessage] email sent successfully: ${snsResult}`);

  return {
    status: "success",
    message: `An Email confirmation has been sent.`,
  };
  
}

// Function to schedule a tour
export async function SendRestaurantEmailFunction(ddbDocClient, tool) {

    console.info("in SendRestaurantEmailFunction and tool\n" + JSON.stringify(tool, null, 2));

    let toolResult = await sendEmail(ddbDocClient, tool);
    
    await saveToolResult(ddbDocClient, tool, toolResult);

    return true;

}
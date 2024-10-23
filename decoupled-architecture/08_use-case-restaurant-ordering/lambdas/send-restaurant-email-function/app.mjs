/**
 *  ScheduleTourFunction
 * 
 * Simple sample function for tool call
 */
import  { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
async function sendEmail(args, evt) {

  // GET the completed order
  const ordersRaw = await ddbDocClient.send(new QueryCommand({ 
    TableName: process.env.TABLE_NAME, 
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)", 
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' }, 
    ExpressionAttributeValues: { ':pk': evt.userContext.pk, ':sk': `restaurantOrder::${evt.ws_connectionId.slice(-4)}::` } } )); 

  const current_order = ordersRaw.Items[0];    
  const order_items_text = current_order.order.order_items.map( it => {
    return  it.line_item;
  });

  // Personalize the message using the userProfile
  const name = evt.userContext?.firstName || "friend";
  const message = `<b>Hi ${name}, Twilio Dough Boys has accepted your order [${order_items_text.join(', ')}]. The total is $${current_order.order.order_total} due on ${current_order.order.order_type}.</b>`;

  if (current_order.order.order_type === "delivery" && current_order.order?.delivery_address) {
    message = message + ` This order will be delivered to ${current_order.order.delivery_address}.`
  }

  let snsPayload = {
    html: message,
    to_email: evt.userContext.email,
    to_name: evt.userContext.firstName,
    subject: `Your Twilio Dough Boys Order! ${evt.ws_connectionId.slice(-4)}`,
    html: message
  };

  let snsResult = await snsClient.send(new PublishCommand({
    Message: JSON.stringify(snsPayload),
    TopicArn: process.env.TWILIO_SEND_EMAIL_TOPIC_ARN
  }));  

  console.log(`[sendAppointmentConfirmationSms] SMS sent successfully: ${snsResult}`);

    return {
      status: "success",
      message: `An SMS confirmation has been sent.`,
    };

  }

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {
        
        let args = JSON.parse(event.function.arguments);

        let toolResult = await sendEmail(args, event);

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
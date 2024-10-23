/**
 *  ScheduleTourFunction
 * 
 * Simple sample function for tool call
 */
import  { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
async function sendSms(args, evt) {

  // Personalize the message using the userProfile
  const name = evt.userContext?.firstName || "friend";
  const apartmentType = args.appointmentDetails.apartmentType;
  const tourType = args.appointmentDetails.type === "in-person" ? "an in-person" : "a self-guided";
  const message = `Hi ${name}, your tour for a ${apartmentType} apartment at Parkview is confirmed for ${args.appointmentDetails.date} at ${args.appointmentDetails.time}. This will be ${tourType} tour. We'll be ready for your visit! Let us know if you have any questions.`;

  let snsPayload = {
    MessageBody: message,
    From: evt.call_details.to_phone, // The "to" is the Twilio number (sender)
    To: evt.call_details.from_phone // The "from" is the user's phone number (recipient)
  };

  let snsResult = await snsClient.send(new PublishCommand({
    Message: JSON.stringify(snsPayload),
    TopicArn: process.env.TWILIO_SEND_MESSAGE_TOPIC_ARN
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

        let toolResult = await sendSms(args, event);

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
/**
 *  SendAppointmentConfirmationSmsFunction
 *
 * Function publishes an SNS message to generate
 * an event which calls another lambda to send an
 * SMS message.
 */

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

import { saveToolResult } from "/opt/save-tool-result.mjs";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  BatchWriteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

async function sendMessage(tool) {
  const args = JSON.parse(tool.function.arguments);

  // Personalize the message using the userProfile
  const name = tool.userContext?.firstName || "friend";
  const apartmentType = args.appointmentDetails.apartmentType;
  const tourType =
    args.appointmentDetails.type === "in-person"
      ? "an in-person"
      : "a self-guided";
  const message = `Hi ${name}, your tour for a ${apartmentType} apartment at Parkview is confirmed for ${args.appointmentDetails.date} at ${args.appointmentDetails.time}. This will be ${tourType} tour. We'll be ready for your visit! Let us know if you have any questions.`;

  // If client call, search for user Item in db
  if (tool.call_details.to_phone === "test:conversationRelay") {
    const user = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: "client:test:conversationRelay", sk: "profile" },
      })
    );
    // Re-write from & to number
    if (user) {
      tool.call_details.from_phone = user.Item.personal_phone;
      tool.call_details.to_phone = user.Item.messagingServiceSid; // this can be a messagingServiceSid or twilio phone number
    } else {
      return {
        status: "error",
        message: "Sorry, there was an issue sending your SMS confirmation",
      };
    }
  }

  let snsPayload = {
    MessageBody: message,
    From: tool.call_details.to_phone, // The "to" is the Twilio number (sender)
    To: tool.call_details.from_phone, // The "from" is the user's phone number (recipient)
  };

  let snsResult = await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify(snsPayload),
      TopicArn: process.env.TWILIO_SEND_MESSAGE_TOPIC_ARN,
    })
  );

  console.log(
    `[SendAppointmentConfirmationSmsFunction] SMS sent successfully: ${snsResult}`
  );

  return {
    status: "success",
    message: `An SMS confirmation has been sent.`,
  };
}

export async function SendAppointmentConfirmationSmsFunction(
  ddbDocClient,
  tool
) {
  console.info("EVENT\n" + JSON.stringify(tool, null, 2));

  try {
    let toolResult = await sendMessage(tool);

    await saveToolResult(ddbDocClient, tool, toolResult);

    return true;
  } catch (error) {
    console.log(
      "Error failed to complete the function [SendAppointmentConfirmationSmsFunction] => ",
      error
    );

    return false;
  }
}

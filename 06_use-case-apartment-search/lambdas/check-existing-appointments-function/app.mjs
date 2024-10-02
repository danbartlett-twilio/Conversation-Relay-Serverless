/**
 *  CheckExistingAppointmentsFunction
 * 
 * Simple sample function for tool call
 */

import { normalizeTimeFormat } from '/opt/apartment-search-util.mjs';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to check existing appointments
async function checkExistingAppointments(args, evt) {

  const { date, time, type, apartmentType } = args;

  const appointmentsRaw = await ddbDocClient.send(new QueryCommand({ 
    TableName: process.env.TABLE_NAME, 
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)", 
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' }, 
    ExpressionAttributeValues: { ':pk': evt.userContext.pk, ':sk': "apartmentAppointment::" } } )); 

  const userAppointments = appointmentsRaw.Items.map( app => {
    return { ...app.appointment };
  });


  // If user has appointments, return them
  if (appointmentsRaw.Items.length > 0) {

    const userAppointments = appointmentsRaw.Items.map( app => {
      return { ...app.appointment };
    });
    
    return {
      appointments: userAppointments,
      message: `You have the following appointments scheduled: ${userAppointments
        .map(
          (appt) =>
            `${appt.date} at ${appt.time} for a ${appt.apartmentType} tour (${appt.type} tour).`
        )
        .join("\n")}`,
    };
  } else {
    // No appointments found
    return {
      appointments: [],
      message:
        "You don't have any appointments scheduled. Would you like to book a tour or check availability?",
    };
  }
}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {

        // const { date, time, type, apartmentType } = args;
        let args = JSON.parse(event.function.arguments);

        let toolResult = await checkExistingAppointments(args, event);

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
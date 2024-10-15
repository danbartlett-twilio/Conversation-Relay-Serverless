/**
 *  ScheduleTourFunction
 * 
 * Simple sample function for tool call
 */

import { normalizeTimeFormat } from '/opt/apartment-search-util.mjs';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
async function scheduleTour(args, evt) {
  const { date, time, type, apartmentType } = args;

  const apartmentsRaw = await ddbDocClient.send(new QueryCommand({ 
    TableName: process.env.TABLE_NAME, 
    KeyConditionExpression: "#pk = :pk", 
    ExpressionAttributeNames: { '#pk': 'pk' }, 
    ExpressionAttributeValues: { ':pk': 'availableApartmentAppointments' } } )); 

  /**
   * pk = availableAppointments
   * sk = 2024-09-15-13:00
   * appointment:
   {
      date: "2024-09-02",
      time: "10:00 AM",
      type: "in-person",
      apartmentType: "one-bedroom",
      },
  *  
  */

  // Format these messages to be ingested by LLM
  const availableAppointments = apartmentsRaw.Items.map(appointment => {                
      return { ...appointment.appointment };
  });         


  console.log(
    `[scheduleTour] Current available appointments:`,
    availableAppointments
  );
  console.log(`[scheduleTour] Received arguments:`, args);

  // Normalize the time input
  const normalizedTime = normalizeTimeFormat(time);
  console.log(`[scheduleTour] Normalized Time: ${normalizedTime}`);

  // Find the index of the matching available appointment slot
  const index = availableAppointments.findIndex(
    (slot) =>
      slot.date === date &&
      slot.time === normalizedTime &&
      slot.type === type &&
      slot.apartmentType === apartmentType
  );

  console.log(`[scheduleTour] Index found: ${index}`);

  // If no matching slot is found, return a message indicating unavailability
  if (index === -1) {
    console.log(`[scheduleTour] The requested slot is not available.`);
    return {
      available: false,
      message: `The ${normalizedTime} slot on ${date} is no longer available. Would you like to choose another time or date?`,
    };
  }


  // DELETE 
  let appt_sk = `${date}::${time}::${apartmentType}::${type}`;
  
  const deleteAppointment = await ddbDocClient.send(new DeleteCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: "availableApartmentAppointments",
      sk: appt_sk
    },
  }))
  console.log("deleteAppointment => ", deleteAppointment);

  // Save new appointment linked to the user to the database              
  let confirmedAppointment = {
    pk: evt.userContext.pk,
    sk: `apartmentAppointment::${appt_sk}`,
    appointment: availableAppointments[index], // Add ID?
    expireAt:  parseInt((Date.now() / 1000) + (86400 * 7))  // Expire "demo" session data automatically (can be removed)
  };
  
  await ddbDocClient.send(
    new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: confirmedAppointment
  }));  

  console.log(`[scheduleTour] Appointment successfully scheduled.`);

  // Return confirmation message for the successful scheduling
  return {
    available: true,
    message: `Your tour is scheduled for ${date} at ${normalizedTime}. Would you like a confirmation via SMS?`,
  };
}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {

        let args = JSON.parse(event.function.arguments);

        let toolResult = await scheduleTour(args, event);

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
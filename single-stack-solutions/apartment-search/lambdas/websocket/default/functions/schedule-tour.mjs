/**
 *  ScheduleTourFunction
 * 
 * Simple sample function for tool call
 */

import { normalizeTimeFormat } from '/opt/apartment-search-util.mjs';

import { QueryCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
async function scheduleTour(ddbDocClient, tool) {
  
  const { date, time, type, apartmentType }  = JSON.parse(tool.function.arguments);      

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
  console.log(`[scheduleTour] Received arguments:`, tool);

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

  // Handles users without a profile
  let userPk = (tool.userContext?.pk) ? tool.userContext.pk : tool.call_details.from_phone;
  
  // Save new appointment linked to the user to the database              
  let confirmedAppointment = {
    pk: userPk,
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

export async function ScheduleTourFunction(ddbDocClient, tool) {

    console.info("EVENT\n" + JSON.stringify(tool, null, 2));    

    try {

        let toolResult = await scheduleTour(ddbDocClient, tool);

        await saveToolResult(ddbDocClient, tool, toolResult);

        return true;

    } catch (error) {
        
        console.log("Error failed to complete the function [ScheduleTourFunction] => ", error);
        
        return false;

    }    

};
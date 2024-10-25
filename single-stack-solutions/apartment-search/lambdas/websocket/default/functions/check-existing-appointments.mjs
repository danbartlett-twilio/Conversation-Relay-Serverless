/**
 *  CheckExistingAppointmentsFunction
 * 
 * Simple sample function for tool call
 */

import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to check existing appointments
async function checkExistingAppointments(ddbDocClient, tool) {

  // Handles users without a profile
  let userPk = (tool.userContext?.pk) ? tool.userContext.pk : tool.call_details.from_phone;

  const appointmentsRaw = await ddbDocClient.send(new QueryCommand({ 
    TableName: process.env.TABLE_NAME, 
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)", 
    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' }, 
    ExpressionAttributeValues: { ':pk': userPk, ':sk': "apartmentAppointment::" } } )); 

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

export async function CheckExistingAppointmentsFunction(ddbDocClient, tool) {

    console.info("EVENT\n" + JSON.stringify(tool, null, 2));    

    try {

        let toolResult = await checkExistingAppointments(ddbDocClient, tool);

        await saveToolResult(ddbDocClient, tool, toolResult);

        return true;

    } catch (error) {
        
        console.log("Error failed to complete the function [CheckExistingAppointmentsFunction] => ", error);
        
        return false;

    }    

};
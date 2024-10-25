/**
 *  CheckAvailabilityFunction
 * 
 * Simple sample function for tool call
 */

import { normalizeTimeFormat } from '/opt/apartment-search-util.mjs';

import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { saveToolResult }  from "/opt/save-tool-result.mjs";

async function checkAvailability(ddbDocClient, tool) {
    
    const { date, time, type, apartmentType } = JSON.parse(tool.function.arguments);
  
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
      `[checkAvailability] Current available appointments:`,
      availableAppointments
    );
    console.log(`[checkAvailability] Received arguments:`, tool);
  
    // Step 1: Check for missing fields and create messages for the LLM to ask the user for them
    const missingFields = [];
  
    if (!date) {
      missingFields.push("date");
    }
  
    if (!type) {
      missingFields.push("tour type (e.g., in-person or self-guided)");
    }
  
    if (!apartmentType) {
      missingFields.push("apartment type (e.g., studio, one-bedroom, etc.)");
    }
  
    // If there are missing fields, return the structured message for the LLM to prompt the user
    if (missingFields.length > 0) {
      return {
        missing_fields: missingFields,
        message: `Please provide the following details: ${missingFields.join(
          ", "
        )}.`,
      };
    }
  
    let normalizedTime = null;
    if (time) {
      normalizedTime = normalizeTimeFormat(time);
    }
  
    // Step 2: Check for an exact match (date, time, type, apartmentType)
    let exactMatchSlot = null;
    if (time) {
      exactMatchSlot = availableAppointments.find(
        (slot) =>
          slot.date === date &&
          slot.time === normalizedTime &&
          slot.type === type &&
          slot.apartmentType === apartmentType
      );
    }
  
    if (exactMatchSlot) {
      console.log(`[checkAvailability] Exact match found.`);
      return {
        availableSlots: [exactMatchSlot],
        message: `The ${time} slot on ${date} is available for an ${type} tour of a ${apartmentType} apartment. Would you like to book this?`,
      };
    }
  
    // Step 3: Check for similar matches (same date, type, apartmentType but different time)
    let similarDateSlots = availableAppointments.filter(
      (slot) =>
        slot.date === date &&
        slot.type === type &&
        slot.apartmentType === apartmentType
    );
  
    if (similarDateSlots.length > 0) {
      console.log(
        `[checkAvailability] Similar matches found (different time on the same date).`
      );
      return {
        availableSlots: similarDateSlots,
        message: `The ${time} slot on ${date} isn't available. Here are other available times for that day: ${similarDateSlots
          .map((slot) => slot.time)
          .join(", ")}. Would any of these work for you?`,
      };
    }
  
    // Step 4: Check for broader matches (same type, apartmentType but different date)
    let broaderSlots = availableAppointments.filter(
      (slot) => slot.type === type && slot.apartmentType === apartmentType
    );
  
    if (broaderSlots.length > 0) {
      console.log(`[checkAvailability] Broader matches found (different date).`);
      return {
        availableSlots: broaderSlots,
        message: `There are no available slots on ${date} for a ${apartmentType} apartment, but here are other available dates: ${broaderSlots
          .map((slot) => `${slot.date} at ${slot.time}`)
          .join(", ")}. Would any of these work for you?`,
      };
    }
  
    // Step 5: If no matches are found at all
    console.log(`[checkAvailability] No available slots found.`);
    return {
      availableSlots: [],
      message: `There are no available slots for a ${apartmentType} apartment at this time. Would you like to explore other options or check availability later?`,
    };
}


export async function CheckAvailabilityFunction(ddbDocClient, tool) {

    console.info("EVENT\n" + JSON.stringify(tool, null, 2));    

    try {

        let toolResult = await checkAvailability(ddbDocClient, tool);

        await saveToolResult(ddbDocClient, tool, toolResult);

        return true;

    } catch (error) {
        
        console.log("Error failed to complete the function [CheckAvailabilityFunction] => ", error);
        
        return false;

    }    

};
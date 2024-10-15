/**
 *  ListAvailableApartmentsFunction
 * 
 * Simple sample function for tool call
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       
  
import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to list available apartments
async function listAvailableApartments(args) {
  
  const apartmentDetailsRaw = await ddbDocClient.send( new GetCommand( { TableName: process.env.TABLE_NAME, Key: { pk: "apartments", sk: "database" } } ));  

  const apartmentDetails = JSON.parse(apartmentDetailsRaw.Item.apartmentDetails);

  try {
    let apartments = Object.keys(apartmentDetails).map((type) => ({
      type,
      ...apartmentDetails[type],
    }));

    // Filter based on user input
    if (args.date) {
      apartments = apartments.filter(
        (apt) => new Date(apt.moveInDate) <= new Date(args.date)
      );
    }
    if (args.budget) {
      apartments = apartments.filter((apt) => apt.rent <= args.budget);
    }
    if (args.apartmentType) {
      apartments = apartments.filter((apt) => apt.type === args.apartmentType);
    }

    // Summarize available apartments
    const summary = apartments
      .map(
        (apt) =>
          `${apt.layout}: $${apt.rent} per month, available from ${
            apt.moveInDate
          }. Features: ${apt.features.join(", ")}.`
      )
      .join("\n\n");

    // If apartments are found, return the structured response
    if (apartments.length > 0) {
      return {
        availableApartments: summary,
        message: `Here are the available apartments based on your search: \n\n${summary}`,
      };
    } else {
      // No apartments found based on the filters
      return {
        availableApartments: [],
        message: "No apartments are available that match your search criteria.",
      };
    }
  } catch (error) {
    console.log(
      `[listAvailableApartments] Error listing available apartments: ${error.message}`
    );
    // Return error message as structured JSON
    return {
      availableApartments: null,
      message: "An error occurred while listing available apartments.",
    };
  }
}


export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {
        
        let args = JSON.parse(event.function.arguments);

        let toolResult = await listAvailableApartments(args);

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
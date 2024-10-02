/**
 *  CommonInquiriesFunction
 * 
 * Simple sample function for tool call
 */

import { normalizeTimeFormat } from '/opt/apartment-search-util.mjs';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to handle common inquiries
async function commonInquiries(args) {

  const { inquiryType, apartmentType } = args;

  const apartmentDetailsRaw = await ddbDocClient.send( new GetCommand( { TableName: process.env.TABLE_NAME, Key: { pk: "apartments", sk: "database" } } ));  

  const apartmentDetails = JSON.parse(apartmentDetailsRaw.Item.apartmentDetails);  
  
  // Map the inquiry types to the database field names
  const inquiryMapping = {
    "pet policy": "petPolicy",
    "income requirements": "incomeRequirements",
    location: "location",
    address: "location", // Map 'address' to 'location' as well
  };

  // If there's a mapped field, use it; otherwise, use the inquiryType directly
  const inquiryField = inquiryMapping[inquiryType] || inquiryType;

  let inquiryDetails;

  if (apartmentType) {
    // Return specific details for the given apartment type
    inquiryDetails = apartmentDetails[apartmentType][inquiryField];

    // If inquiry is for location/address, format the location details
    if (inquiryField === "location" && inquiryDetails) {
      inquiryDetails = `${inquiryDetails.street}, ${inquiryDetails.city}, ${inquiryDetails.state}, ${inquiryDetails.zipCode}`;
    }
  } else {
    // Return general details across all apartment types
    inquiryDetails = Object.keys(apartmentDetails)
      .map((key) => {
        const details = apartmentDetails[key][inquiryField];
        if (inquiryField === "location" && details) {
          return `${details.street}, ${details.city}, ${details.state}, ${details.zipCode}`;
        }
        return details;
      })
      .filter(Boolean)
      .join(" ");
  }

  // Return the structured result based on the inquiryDetails
  if (inquiryDetails) {
    return {
      inquiryDetails,
      message: `Here are the details about ${inquiryType} for the ${
        apartmentType ? apartmentType : "available apartments"
      }: ${inquiryDetails}`,
    };
  } else {
    // Return structured JSON indicating no information available
    return {
      inquiryDetails: null,
      message: `I'm sorry, I don't have information about ${inquiryType}.`,
    };
  }

}

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    try {

        let args = JSON.parse(event.function.arguments);

        let toolResult = await commonInquiries(args, event);

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
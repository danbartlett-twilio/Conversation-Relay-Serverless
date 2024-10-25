/**
 *  CommonInquiriesFunction
 * 
 * Simple sample function for tool call
 */
import { GetCommand } from "@aws-sdk/lib-dynamodb";

import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to handle common inquiries
async function commonInquiries(ddbDocClient, tool) {

  const { inquiryType, apartmentType } = JSON.parse(tool.function.arguments);

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

export async function CommonInquiriesFunction(ddbDocClient, tool) {

    console.info("EVENT\n" + JSON.stringify(tool, null, 2));    

    try {

        let toolResult = await commonInquiries(ddbDocClient, tool);

        await saveToolResult(ddbDocClient, tool, toolResult);

        return true;

    } catch (error) {
        
        console.log("Error failed to complete the function [CommonInquiriesFunction] => ", error);
        
        return false;

    }    

};
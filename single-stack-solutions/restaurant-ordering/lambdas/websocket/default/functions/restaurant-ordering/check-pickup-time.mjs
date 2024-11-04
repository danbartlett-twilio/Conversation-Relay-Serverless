/**
 *  checkDeliveryTime
 * 
 * Simple sample function for tool call
 */
   
import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
export async function CheckRestaurantPickUpTime(ddbDocClient, tool) {

    console.info("in CheckRestaurantPickUpTime and tool\n" + JSON.stringify(tool, null, 2));    

    let args = JSON.parse(tool.function.arguments);

    console.info("args\n" + JSON.stringify(args, null, 2));    

    let pickupTimes = [
        {time: "15 minutes", message:"We are starting your order right now! See you in 15 minutes."},
        {time: "30 minutes", message:"We will your order ready in 30 minutes."},
        {time: "45 minutes", message:"We are a little backed up right now so you order will be ready in 45 minutes."}
      ];
    
      let pickupTime = pickupTimes[ ( Math.floor (Math.random() * pickupTimes.length) ) ];
    
      // Return confirmation message for the successful scheduling

    console.log(`[CheckPickUptime] successfully run.`);

    let toolResult = { pickupTime: pickupTime.time, message: pickupTime.message };

    await saveToolResult(ddbDocClient, tool, toolResult);

    return true;

}
/**
 *  checkDeliveryTime
 * 
 * Simple sample function for tool call
 */
   
import { saveToolResult }  from "/opt/save-tool-result.mjs";

// Function to schedule a tour
export async function CheckRestaurantDeliveryTime(ddbDocClient, tool) {

    console.info("in CheckRestaurantDeliveryTime and tool\n" + JSON.stringify(tool, null, 2));    

    let args = JSON.parse(tool.function.arguments);

    console.info("args\n" + JSON.stringify(args, null, 2));    

    let deliveryTimes = [
        {time: "45 minutes", message:"We are starting your order right now and can have it to you in 45."},
        {time: "1 hour", message:"We will deliver your order in one hour."},
        {time: "1 hour and 15 minutes", message:"We are a little backed up right now so we will delivery your order in one hour and 15 minutes."}
    ];

    let deliveryTime = deliveryTimes[ ( Math.floor (Math.random() * deliveryTimes.length) ) ];
  
    console.log(`[checkDeliveryTime] successfully run.`);

    let toolResult = { deliveryTime: deliveryTime.time, message: deliveryTime.message };

    await saveToolResult(ddbDocClient, tool, toolResult);

    return true;

}
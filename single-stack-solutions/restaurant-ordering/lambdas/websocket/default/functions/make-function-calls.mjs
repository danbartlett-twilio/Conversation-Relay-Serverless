/**
 * makeFunctionCalls
 * 
 */

import { PlaceOrderFunction } from './place-order.mjs';
import { CheckRestaurantDeliveryTime } from './check-delivery-time.mjs';
import { CheckRestaurantPickUpTime } from './check-pickup-time.mjs';
import { SendRestaurantSmsFunction } from './send-sms-confirmation.mjs';
import { SendRestaurantEmailFunction } from './send-email-confirmation.mjs';

// Functions are called dynamically but ONLY if they match a function
// in this object.
const FunctionHandler = {
    PlaceOrderFunction,
    CheckRestaurantPickUpTime,
    CheckRestaurantDeliveryTime,
    SendRestaurantSmsFunction,
    SendRestaurantEmailFunction
};

export async function makeFunctionCalls(ddbDocClient, tool_calls_object, connectionId, callConnection) {

    const tool_calls = Object.values(tool_calls_object).map(tool => {                
        return {             
            ...tool, 
            ws_connectionId: connectionId, 
            userContext: callConnection.Item.userContext,
            call_details: {
                to_phone: callConnection.Item.To,
                from_phone: callConnection.Item.From,
                twilio_call_sid: callConnection.Item.CallSid,
                twilio_account_sid: callConnection.Item.AccountSid                            
            }
        };                                                
    });          

    await Promise.all(tool_calls.map(async (tool) => {

        console.log("tool in promise all => ", tool);
        await FunctionHandler[tool.function.name](ddbDocClient, tool);

    }));
    
    return true;
}
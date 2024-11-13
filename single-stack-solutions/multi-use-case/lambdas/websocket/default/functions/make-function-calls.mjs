/**
 * makeFunctionCalls
 *
 */

//Restaurant Ordering
import { PlaceOrderFunction } from "./restaurant-ordering/place-order.mjs";
import { CheckRestaurantDeliveryTime } from "./restaurant-ordering/check-delivery-time.mjs";
import { CheckRestaurantPickUpTime } from "./restaurant-ordering/check-pickup-time.mjs";
import { SendRestaurantSmsFunction } from "./restaurant-ordering/send-sms-confirmation.mjs";
import { SendRestaurantEmailFunction } from "./restaurant-ordering/send-email-confirmation.mjs";
// Apartment Search
import { CheckAvailabilityFunction } from "./apartment-search/check-availability.mjs";
import { CheckExistingAppointmentsFunction } from "./apartment-search/check-existing-appointments.mjs";
import { CommonInquiriesFunction } from "./apartment-search/common-inquiries.mjs";
import { ListAvailableApartmentsFunction } from "./apartment-search/list-available-apartments.mjs";
import { ScheduleTourFunction } from "./apartment-search/schedule-tour.mjs";
import { SendAppointmentConfirmationSmsFunction } from "./apartment-search/send-appointment-confirmation-sms.mjs";
//Retail Owl Shoes
// import { PlaceRetailFunction } from "./place-order.mjs";
// import { CheckRetailtDeliveryTime } from "./owl-shoes-retail/check-delivery-time.mjs";
// import { CheckRetailPickUpTime } from "./owl-shoes-retail/check-pickup-time.mjs";
// import { SendRetailSmsFunction } from "./owl-shoes-retail/send-sms-confirmation.mjs";
// import { SendRetailEmailFunction } from "./owl-shoes-retail/send-email-confirmation.mjs";

// Functions are called dynamically but ONLY if they match a function
// in this object.
const FunctionHandler = {
  //Restaurant Ordering
  PlaceOrderFunction,
  CheckRestaurantPickUpTime,
  CheckRestaurantDeliveryTime,
  SendRestaurantSmsFunction,
  SendRestaurantEmailFunction,
  //Apartment Search
  CheckAvailabilityFunction,
  CheckExistingAppointmentsFunction,
  CommonInquiriesFunction,
  ListAvailableApartmentsFunction,
  ScheduleTourFunction,
  SendAppointmentConfirmationSmsFunction,
  //Retail Owl Shoes
  //to do update
};

export async function makeFunctionCalls(
  ddbDocClient,
  tool_calls_object,
  connectionId,
  callConnection
) {
  const tool_calls = Object.values(tool_calls_object).map((tool) => {
    return {
      ...tool,
      ws_connectionId: connectionId,
      userContext: callConnection.Item.userContext,
      call_details: {
        to_phone: callConnection.Item.To,
        from_phone: callConnection.Item.From,
        twilio_call_sid: callConnection.Item.CallSid,
        twilio_account_sid: callConnection.Item.AccountSid,
      },
    };
  });

  await Promise.all(
    tool_calls.map(async (tool) => {
      console.log("tool in promise all => ", tool);
      await FunctionHandler[tool.function.name](ddbDocClient, tool);
    })
  );

  return true;
}

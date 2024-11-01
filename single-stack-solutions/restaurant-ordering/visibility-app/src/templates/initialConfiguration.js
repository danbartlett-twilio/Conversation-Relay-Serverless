const initialConfiguration = [
  {
    pk: "apartmentSearchUseCase",
    pk1: "use-case",
    sk: "configuration",
    sk1: "apartmentSearchUseCase",
    conversationRelayParams: {
      dtmfDetection: true,
      interruptByDtmf: true,
      ttsProvider: "amazon",
      voice: "Amy-Generative",
      welcomeGreeting:
        "Hello there! I'm Amy from Parkview apartments, how can I help?",
      interruptible: true,
      profanityFilter: true,
      transcriptionProvider: "google",
      speechModel: "telephony",
      language: "en-US",
    },
    dtmfHandlers:
      '{"0":{"replyWithText":true,"replyText":"You pressed 0.","replyWithFunction":false,"replyFunction":""},"1":{"replyWithText":true,"replyText":"You pressed 1.","replyWithFunction":false,"replyFunction":""},"2":{"replyWithText":true,"replyText":"You pressed 2.","replyWithFunction":false,"replyFunction":""},"3":{"replyWithText":true,"replyText":"You pressed 3.","replyWithFunction":false,"replyFunction":""},"4":{"replyWithText":true,"replyText":"You pressed 4.","replyWithFunction":false,"replyFunction":""},"5":{"replyWithText":true,"replyText":"You pressed 5.","replyWithFunction":false,"replyFunction":""},"6":{"replyWithText":true,"replyText":"You pressed 6.","replyWithFunction":false,"replyFunction":""},"7":{"replyWithText":true,"replyText":"You pressed 7.","replyWithFunction":false,"replyFunction":""},"8":{"replyWithText":true,"replyText":"You pressed 8.","replyWithFunction":false,"replyFunction":""},"9":{"replyWithText":true,"replyText":"You pressed 9.","replyWithFunction":false,"replyFunction":""}}',
    prompt:
      "## Objective\\nYou are a voice AI agent assisting users with apartment leasing inquiries. Your primary tasks include scheduling tours, checking availability, providing apartment listings, and answering common questions about the properties. The current date is <<CURRENT_DATE>>, so all date-related operations should assume this. Since this is a voice application, all responses should be in plain text. Do not use markdown or any additional formatting.\\n\\n<<USER_CONTEXT>>\\n\\n## Guidelines\\nVoice AI Priority: This is a Voice AI system. Responses must be concise, direct, and conversational. Avoid any messaging-style elements like numbered lists, special characters, or emojis, as these will disrupt the voice experience.\\nCritical Instruction: Ensure all responses are optimized for voice interaction, focusing on brevity and clarity. Long or complex responses will degrade the user experience, so keep it simple and to the point.\\nAvoid repetition: Rephrase information if needed but avoid repeating exact phrases.\\nBe conversational: Use friendly, everyday language as if you are speaking to a friend.\\nUse emotions: Engage users by incorporating tone, humor, or empathy into your responses.\\nAlways Validate: When a user makes a claim about apartment details (e.g., square footage, fees), always verify the information against the actual data in the system before responding. Politely correct the user if their claim is incorrect, and provide the accurate information.\\nDTMF Capabilities: Inform users that they can press '1' to list available apartments or '2' to check all currently scheduled appointments. This should be communicated subtly within the flow of the conversation, such as after the user asks for information or when there is a natural pause.\\nAvoid Assumptions: Difficult or sensitive questions that cannot be confidently answered authoritatively should result in a handoff to a live agent for further assistance.\\nUse Tools Frequently: Avoid implying that you will verify, research, or check something unless you are confident that a tool call will be triggered to perform that action. If uncertain about the next step or the action needed, ask a clarifying question instead of making assumptions about verification or research.\\n\\n## Context\\nParkview Apartments is located in Missoula, Montana. All inquiries, listings, and availability pertain to this location. Ensure this geographical context is understood and avoid referencing other cities or locations unless explicitly asked by the user.\\n\\n## Function Call Guidelines\\nOrder of Operations:\\n  - Always check availability before scheduling a tour.\\n  - Ensure all required information is collected before proceeding with a function call.\\n\\n### Schedule Tour:\\n  - This function should only run as a single tool call, never with other tools\\n  - This function can only be called after confirming availability, but it should NEVER be called when the user asks for or confirms they'd like an SMS Confirmation. \\n  - Required data includes date, time, tour type (in-person or self-guided), and apartment type.\\n  - If any required details are missing, prompt the user to provide them.\\n\\n### Check Availability:\\n  - This function requires date, tour type, and apartment type.\\n  - If any of these details are missing, ask the user for them before proceeding.\\n  - If the user insists to hear availability, use the 'listAvailableApartments' function.\\n  - If the requested time slot is unavailable, suggest alternatives and confirm with the user.\\n\\n### List Available Apartments: \\n  - Trigger this function if the user asks for a list of available apartments or does not want to provide specific criteria.\\n  - Also use this function when the user inquires about general availability without specifying detailed criteria.\\n  - If criteria like move-in date, budget, or apartment layout are provided, filter results accordingly.\\n  - Provide concise, brief, summarized responses.\\n\\n### Check Existing Appointments: \\n  - Trigger this function if the user asks for details about their current appointments\\n  - Provide concise, brief, summarized responses.\\n\\n### Common Inquiries:\\n  - Use this function to handle questions related to pet policy, fees, parking, specials, location, address, and other property details.\\n  - For any location or address inquiries, the system should always call the 'commonInquiries' function using the 'location' field.\\n  - If the user provides an apartment type, retrieve the specific address associated with that type from the database.\\n  - If no apartment type is specified, provide general location details.\\n\\n### Live Agent Handoff:\\n  - Trigger the 'liveAgentHandoff' tool call if the user requests to speak to a live agent, mentions legal or liability topics, or any other sensitive subject where the AI cannot provide a definitive answer.\\n  - Required data includes a reason code (\\\"legal\\\", \\\"liability\\\", \\\"financial\\\", or \\\"user-requested\\\") and a brief summary of the user query.\\n  - If any of these situations arise, automatically trigger the liveAgentHandoff tool call.\\n\\n### SMS Confirmations: \\n  - SMS confirmations should NEVER be coupled with function calls to 'scheduleTour'.\\n  - Only offer to send an SMS confirmation if the user has successfully scheduled a tour, and the user agrees to receive one. \\n  - If the user agrees, trigger the tool call 'sendAppointmentConfirmationSms' with the appointment details and the user's phone number, but do not trigger another 'scheduleTour' function call.\\n  - Do not ask for the user's phone number if you've already been referencing them by name during the conversation. Assume the phone number is already available to the function.\\n\\n## Important Notes\\n- Always ensure the user's input is fully understood before making any function calls.\\n- If required details are missing, prompt the user to provide them before proceeding.\\n\\nRemember that all replies should be returned in plain text. Do not return markdown!",
    title: "Apartment Search",
    description:
      "A property leasing use case where a user can schedule tours and inquire about available apartments.",
    tools:
      '[{"type":"function","function":{"name":"PlaceOrderFunction","description":"When a caller has finished adding items to an order, use this tool to save and place the order.","parameters":{"type":"object","properties":{"current_order":{"type":"array","description":"The restaurant order containing all of the items the user wants in this order.","items":{"type":"object","properties":{"line_item":{"type":"string","description":"The menu title of the item in the order plus any additions like toppings."},"additonal_details":{"type":"string","description":"Additional toppings or any details about this menu item."},"line_amount":{"type":"number","description":"The amount of this item in the order."}},"required":["line_item","line_amount"]}},"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."},"order_total":{"type":"number","description":"The sum amount of all of order items."},"delivery_address":{"type":"string","description":"Street address, city, state and zip code for the delivery."}},"required":["order_type","order_total"]}}},{"type":"function","function":{"name":"SendRestaurantSmsFunction","description":"Sends an SMS message if requested by the user for the order confirmation or for restaurant hours or location.","parameters":{"type":"object","properties":{"message_type":{"type":"string","enum":["order confirmation","hours","location"],"description":"The type of message to send."},"restaurant_hours":{"type":"string","description":"The hours of operation for the restaurant."},"restaurant_location":{"type":"string","description":"The location of the restaurant."}}}}},{"type":"function","function":{"name":"SendRestaurantEmailFunction","description":"Sends an Email if requested by the user for the order confirmation.","parameters":{"type":"object","properties":{"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."},"message_type":{"type":"string","enum":["order confirmation"],"description":"The type of email to send."},"to_email":{"type":"string","description":"The email address confirmed by the caller."}},"required":["to_email"]}}},{"type":"function","function":{"name":"CheckRestaurantPickUpTime","description":"This function checks to see when the order will be ready for pickup.","parameters":{"type":"object","properties":{"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."}},"required":["order_type"]}}},{"type":"function","function":{"name":"CheckRestaurantDeliveryTime","description":"This function checks to see when the order will be delivered.","parameters":{"type":"object","properties":{"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."}},"required":["order_type"]}}}]',
  },
  {
    pk: "restaurantOrderingUseCase",
    pk1: "use-case",
    sk: "configuration",
    sk1: "restaurantOrderingUseCase",
    conversationRelayParams: {
      dtmfDetection: true,
      interruptByDtmf: true,
      ttsProvider: "google",
      voice: "en-US-Journey-O",
      welcomeGreeting:
        "Thanks for calling Twilio Dough Boy Pizza! How can I help you?",
      interruptible: true,
      profanityFilter: true,
      transcriptionProvider: "google",
      speechModel: "telephony",
      language: "en-US",
    },
    dtmfHandlers:
      '{"0":{"replyWithText":true,"replyText":"You pressed 0.","replyWithFunction":false,"replyFunction":""},"1":{"replyWithText":true,"replyText":"You pressed 1.","replyWithFunction":false,"replyFunction":""},"2":{"replyWithText":true,"replyText":"You pressed 2.","replyWithFunction":false,"replyFunction":""},"3":{"replyWithText":true,"replyText":"You pressed 3.","replyWithFunction":false,"replyFunction":""},"4":{"replyWithText":true,"replyText":"You pressed 4.","replyWithFunction":false,"replyFunction":""},"5":{"replyWithText":true,"replyText":"You pressed 5.","replyWithFunction":false,"replyFunction":""},"6":{"replyWithText":true,"replyText":"You pressed 6.","replyWithFunction":false,"replyFunction":""},"7":{"replyWithText":true,"replyText":"You pressed 7.","replyWithFunction":false,"replyFunction":""},"8":{"replyWithText":true,"replyText":"You pressed 8.","replyWithFunction":false,"replyFunction":""},"9":{"replyWithText":true,"replyText":"You pressed 9.","replyWithFunction":false,"replyFunction":""}}',
    prompt:
      '## Objective\\nYou are a voice AI agent for the restaurant \\"Twilio Dough Boy Pizza\\". Your primary task is to take new orders for this restaurant. You can also check past orders and answer basic questions about the restaurant\'s location and store hours.  If the caller asks about anything else, politely tell them what you can do. \\n\\n## Guidelines\\nVoice AI Priority: This is a Voice AI system. Responses must be concise, direct, and conversational. Avoid any messaging-style elements like markdown, numbered lists, special characters, or emojis, as these will disrupt the voice experience.\\nCritical Instruction: Ensure all responses are optimized for voice interaction, focusing on brevity and clarity. Long or complex responses will degrade the user experience, so keep it simple and to the point.\\nAvoid repetition: Rephrase information if needed but avoid repeating exact phrases.\\nBe conversational: Use friendly, everyday language as if you are speaking to a friend.\\nUse emotions: Engage users by incorporating tone, humor, or empathy into your responses.\\nAlways Validate: Be sure you understand each item in the order. Politely validate item details if you are unsure.\\n\\nThe restaurant\'s address is 101 Spear Street, San Francisco, CA, 94105. When replying back with the zip code of the restaurant address or for a delivery address, separate each digit with a space. The store hours are Tuesday through Thursday from 11 AM to 9 PM, Friday and Saturday 11 AM to 11 PM, and the restaurant is closed on Sundays and Mondays.\\n\\nThe current date and time is <<CURRENT_DATE>>. Use this date and time for scheduling orders and for store hours.\\n\\n<<USER_CONTEXT>>\\n\\nIf this is an order, first ask if this order is for pickup or delivery.  If the order is for delivery, please check or confirm the address for delivery.\\n\\nCallers can only order items from the menu. If they ask for something that is not on the menu, politely say that it is not available. Ask for items for their current order one at a time. If a caller ask for suggestions of what to order, you can recommend \\"The Works\\" pizza. For the pizzas, each menu item first has a name, and then a description, and finally prices for small, medium, and large sizes. Only use the description of a pizza if the caller wants to know more details about a specific pizza.\\n\\nWhen a caller orders a pizza, ask for the size and if they want any additional toppings. Add the additional cost of any toppings added to the pizza to the total prize of the pizza. \\n\\nAfter a caller has confirmed an item for their order, ask them if they want to add anything else to their order. If they are done adding items, ask them if they are ready to place the order. If they are ready to place the order, read back all of the items back to the caller and provide a final total for the entire order. Only read the entire order back to them once. If they have changes, make changes to to the order. If they agree that the order is correct, then call the Place Order function (PlaceOrderFunction). Only call the Place Order Function once.\\n\\nAfter call the Place Order Function, tell the caller you will check on the timing of their order and call either the CheckRestaurantDeliveryTime function or the CheckRestaurantPickUpTime function depending on the order type. Let the caller know when their order will be ready for pick up or delivery before proceeding. \\n\\nFinally, ask the caller if they would like to receive a confirmation text message. If they do, then call SendRestaurantSmsFunction function.\\n\\nEnd the call by thanking the caller.\\n\\n## menu\\n\\n# Starters:\\n- Mozzarella Sticks -- $7.75\\n- Onion Rings -- $7.75\\n- Popcorn Shrimp -- $9.95\\n- Jalapeno Poppers -- $8.50\\n\\n# Salads\\n- Caesar Salad -- $9.95\\n- Mixed Greens Salad -- $10.95\\n- Cobb Salad -- $12.95\\n\\n# Pizzas\\n- Cheese Cheese, \\"Classic cheese with zesty red sauce\\" -- $10.95, $13.95, $16.95\\n- Classic Pepperoni, \\"Classic cheese and pepperoni pizza\\" -- $12.95, $15.95, $19.95\\n- Hawaiian, \\"Ham and pineapple\\" -- $12.95, $15.95, $19.95\\n- The Works, \\"Sausage, meatball, pepperoni, mushroom, onion, tomatoes, and peppers\\" -- $15.95, $18.95, $23.95\\n\\n# Toppings for Pizzas\\n- Pepperoni - $2.99\\n- Mushroom - $1.99\\n- Extra cheese - $1.99\\n- Sausage - $2.99\\n- Onion - $1.99\\n- Black olives - $1.99\\n- Green pepper - $1.99\\n- Fresh garlic - $1.99\\n- Fresh basil - $1.99\\n- tomato - $1.99\\n\\n# Calzones\\n- Cheese Calzone -- $11.75\\n- Pepperoni Calzone -- $15.75\\n- Veggie Stromboli -- $13.75\\n- Ham -- $15.75\\n\\n## Function Call Guidelines\\nOrder of Operations:\\n  - Always check availability before scheduling a tour.\\n  - Ensure all required information is collected before proceeding with a function call.\\n\\n### Place Order:\\n  - This function is called \\"PlaceOrderFunction\\"\\n  - This function should only run as a single tool call, never with other tools\\n  - This function should be called after you have confirmed that the user is ready to complete the order.\\n  - This function has the parameter \\"current_order\\" which has an array of items. Each item in the items array is an item that has been selected for this order. \\n  - The line_item property should be the title from the menu. \\n  - The line_amount property is the cost for the item. \\n  - The additonal_details property is optional and should be used for additional toppings added to pizzas or for any notes that caller wants to add about the specific item on the order. For example, if the caller wants salad dressing on the side for a salad.\\n  -- If the order_type is \\"delivery\\" then include the address provided by the caller in the delivery_address property. \\n  -- order_total is sum total of all of the order items. \\n\\n### Check Delivery Time:\\n  - This function is called \\"CheckRestaurantDeliveryTime\\"\\n  - This function checks when the order will be delivered to the customer\'s address.\\n  - This function should only run as a single tool call, never with other tools\\n  - This function should be called after the Place Order Function has been completed for delvery orders.\\n\\n### Check Pick Up Time:\\n  - This function is called \\"CheckRestaurantPickUpTime\\"\\n  - This function checks when the order will be ready to be picked up.\\n  - This function should only run as a single tool call, never with other tools\\n  - This function should be called after the Place Order Function has been completed for pickup orders.\\n\\n### Live Agent Handoff:\\n  - Trigger the \'liveAgentHandoff\' tool call if the user requests to speak to a live agent, mentions legal or liability topics, or any other sensitive subject where the AI cannot provide a definitive answer.\\n  - Required data includes a reason code (\\"legal\\", \\"liability\\", \\"financial\\", or \\"user-requested\\") and a brief summary of the user query.\\n  - If any of these situations arise, automatically trigger the liveAgentHandoff tool call.\\n\\n### Send SMS Message: \\n  - This function\'s name is \\"SendRestaurantSmsFunction\\"\\n  - SMS Messages can be sent after an order has been accepted using the Place Order Function, or can be sent if a user wants the restaurant location to be sent to them.\\n  - If the user agrees to receive a text message (SMS), trigger the tool call \'sendRestaurantSms\' with the order details.\\n  - Do not ask for the user\'s phone number if you\'ve already been referencing them by name during the conversation. Assume the phone number is already available to the function.\\n\\n### Send Email Message: \\n  - An email can be sent ONLY if you already have their email address. You cannot ask for their email address.\\n  - An Email can be sent after an order has been completed.  \\n  - This function is only available if you already have the caller\'s email address.\\n  - If the user confirms that they want to receive an email, trigger the tool call \'sendRestaurantEmail\'\\n\\n## Important Notes\\n- Always ensure the user\'s input is fully understood before making any function calls.\\n- If required details are missing, prompt the user to provide them before proceeding.\\n\\nRemember that all replies should be returned in plain text. Do not return markdown!',
    title: "Restaurant Ordering",
    description:
      "Demonstrate how a customer can call into a restaurant and place an order",
    tools:
      '[{"type":"function","function":{"name":"PlaceOrderFunction","description":"When a caller has finished adding items to an order, use this tool to save and place the order.","parameters":{"type":"object","properties":{"current_order":{"type":"array","description":"The restaurant order containing all of the items the user wants in this order.","items":{"type":"object","properties":{"line_item":{"type":"string","description":"The menu title of the item in the order plus any additions like toppings."},"additonal_details":{"type":"string","description":"Additional toppings or any details about this menu item."},"line_amount":{"type":"number","description":"The amount of this item in the order."}},"required":["line_item","line_amount"]}},"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."},"order_total":{"type":"number","description":"The sum amount of all of order items."},"delivery_address":{"type":"string","description":"Street address, city, state and zip code for the delivery."}},"required":["order_type","order_total"]}}},{"type":"function","function":{"name":"SendRestaurantSmsFunction","description":"Sends an SMS message if requested by the user for the order confirmation or for restaurant hours or location.","parameters":{"type":"object","properties":{"message_type":{"type":"string","enum":["order confirmation","hours","location"],"description":"The type of message to send."},"restaurant_hours":{"type":"string","description":"The hours of operation for the restaurant."},"restaurant_location":{"type":"string","description":"The location of the restaurant."}}}}},{"type":"function","function":{"name":"SendRestaurantEmailFunction","description":"Sends an Email if requested by the user for the order confirmation.","parameters":{"type":"object","properties":{"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."},"message_type":{"type":"string","enum":["order confirmation"],"description":"The type of email to send."},"to_email":{"type":"string","description":"The email address confirmed by the caller."}},"required":["to_email"]}}},{"type":"function","function":{"name":"CheckRestaurantPickUpTime","description":"This function checks to see when the order will be ready for pickup.","parameters":{"type":"object","properties":{"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."}},"required":["order_type"]}}},{"type":"function","function":{"name":"CheckRestaurantDeliveryTime","description":"This function checks to see when the order will be delivered.","parameters":{"type":"object","properties":{"order_type":{"type":"string","enum":["pickup","delivery"],"description":"The type of order."}},"required":["order_type"]}}}]',
  },
];

exports.array = initialConfiguration;

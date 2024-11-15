/**
 * apartmentSearchUseCase.js
 *
 * This is a DynamoDB JSON file used to load data into the DynamoDB instance.
 *
 * The command to load this item is in the "command-..." file in
 * the parent directory of this stack.
 *
 */

let useCase = {
  pk: {
    S: "apartmentSearchUseCase",
  },
  sk: {
    S: "configuration",
  },
  conversationRelayParams: {
    M: {
      dtmfDetection: {
        BOOL: true,
      },
      interruptByDtmf: {
        BOOL: true,
      },
      interruptible: {
        BOOL: true,
      },
      language: {
        S: "en-US",
      },
      profanityFilter: {
        BOOL: true,
      },
      speechModel: {
        S: "nova-2-general",
      },
      transcriptionProvider: {
        S: "deepgram",
      },
      ttsProvider: {
        S: "amazon",
      },
      voice: {
        S: "Amy-Generative",
      },
      welcomeGreeting: {
        S: "Hello there! I'm Amy from Parkview apartments, how can I help?",
      },
    },
  },
  description: {
    S: "A property leasing use case where a user can schedule tours and inquire about available apartments.",
  },
  dtmfHandlers: {
    S: '{"0":{"replyWithText":true,"replyText":"You pressed 0.","replyWithFunction":false,"replyFunction":""},"1":{"replyWithText":true,"replyText":"Let me get the available apartments.","replyWithFunction":true,"replyFunction":"ListAvailableApartmentsFunction"},"2":{"replyWithText":true,"replyText":"I\'ll check on your appointments","replyWithFunction":true,"replyFunction":"CheckExistingAppointmentsFunction"},"3":{"replyWithText":true,"replyText":"You pressed 3.","replyWithFunction":false,"replyFunction":""},"4":{"replyWithText":true,"replyText":"You pressed 4.","replyWithFunction":false,"replyFunction":""},"5":{"replyWithText":true,"replyText":"You pressed 5.","replyWithFunction":false,"replyFunction":""},"6":{"replyWithText":true,"replyText":"You pressed 6.","replyWithFunction":false,"replyFunction":""},"7":{"replyWithText":true,"replyText":"You pressed 7.","replyWithFunction":false,"replyFunction":""},"8":{"replyWithText":true,"replyText":"You pressed 8.","replyWithFunction":false,"replyFunction":""},"9":{"replyWithText":true,"replyText":"You pressed 9.","replyWithFunction":false,"replyFunction":""}}',
  },
  pk1: {
    S: "use-case",
  },
  prompt: {
    S: "## Objective\nYou are a voice AI agent assisting users with apartment leasing inquiries. Your primary tasks include scheduling tours, checking availability, providing apartment listings, and answering common questions about the properties. The current date is <<CURRENT_DATE>>, so all date-related operations should assume this. Since this is a voice application, all responses should be in plain text. Do not use markdown or any additional formatting.\n\n<<USER_CONTEXT>>\n\n## Guidelines\nVoice AI Priority: This is a Voice AI system. Responses must be concise, direct, and conversational. Avoid any messaging-style elements like numbered lists, special characters, or emojis, as these will disrupt the voice experience.\nCritical Instruction: Ensure all responses are optimized for voice interaction, focusing on brevity and clarity. Long or complex responses will degrade the user experience, so keep it simple and to the point.\nAvoid repetition: Rephrase information if needed but avoid repeating exact phrases.\nBe conversational: Use friendly, everyday language as if you are speaking to a friend.\nUse emotions: Engage users by incorporating tone, humor, or empathy into your responses.\nAlways Validate: When a user makes a claim about apartment details (e.g., square footage, fees), always verify the information against the actual data in the system before responding. Politely correct the user if their claim is incorrect, and provide the accurate information.\nDTMF Capabilities: Inform users that they can press '1' to list available apartments or '2' to check all currently scheduled appointments. This should be communicated subtly within the flow of the conversation, such as after the user asks for information or when there is a natural pause.\nAvoid Assumptions: Difficult or sensitive questions that cannot be confidently answered authoritatively should result in a handoff to a live agent for further assistance.\nUse Tools Frequently: Avoid implying that you will verify, research, or check something unless you are confident that a tool call will be triggered to perform that action. If uncertain about the next step or the action needed, ask a clarifying question instead of making assumptions about verification or research.\n\n## Context\nParkview Apartments is located in Missoula, Montana. All inquiries, listings, and availability pertain to this location. Ensure this geographical context is understood and avoid referencing other cities or locations unless explicitly asked by the user.\n\n## Function Call Guidelines\nOrder of Operations:\n  - Always check availability before scheduling a tour.\n  - Ensure all required information is collected before proceeding with a function call.\n\n### Schedule Tour:\n  - This function should only run as a single tool call, never with other tools\n  - This function can only be called after confirming availability, but it should NEVER be called when the user asks for or confirms they'd like an SMS Confirmation. \n  - Required data includes date, time, tour type (in-person or self-guided), and apartment type.\n  - If any required details are missing, prompt the user to provide them.\n\n### Check Availability:\n  - This function requires date, tour type, and apartment type.\n  - If any of these details are missing, ask the user for them before proceeding.\n  - If the user insists to hear availability, use the 'listAvailableApartments' function.\n  - If the requested time slot is unavailable, suggest alternatives and confirm with the user.\n\n### List Available Apartments: \n  - Trigger this function if the user asks for a list of available apartments or does not want to provide specific criteria.\n  - Also use this function when the user inquires about general availability without specifying detailed criteria.\n  - If criteria like move-in date, budget, or apartment layout are provided, filter results accordingly.\n  - Provide concise, brief, summarized responses.\n\n### Check Existing Appointments: \n  - Trigger this function if the user asks for details about their current appointments\n  - Provide concise, brief, summarized responses.\n\n### Common Inquiries:\n  - Use this function to handle questions related to pet policy, fees, parking, specials, location, address, and other property details.\n  - For any location or address inquiries, the system should always call the 'commonInquiries' function using the 'location' field.\n  - If the user provides an apartment type, retrieve the specific address associated with that type from the database.\n  - If no apartment type is specified, provide general location details.\n\n### Live Agent Handoff:\n  - Trigger the 'liveAgentHandoff' tool call if the user requests to speak to a live agent, mentions legal or liability topics, or any other sensitive subject where the AI cannot provide a definitive answer.\n  - Required data includes a reason code (\"legal\", \"liability\", \"financial\", or \"user-requested\") and a brief summary of the user query.\n  - If any of these situations arise, automatically trigger the liveAgentHandoff tool call.\n\n### SMS Confirmations: \n  - SMS confirmations should NEVER be coupled with function calls to 'scheduleTour'.\n  - Only offer to send an SMS confirmation if the user has successfully scheduled a tour, and the user agrees to receive one. \n  - If the user agrees, trigger the tool call 'sendAppointmentConfirmationSms' with the appointment details and the user's phone number, but do not trigger another 'scheduleTour' function call.\n  - Do not ask for the user's phone number if you've already been referencing them by name during the conversation. Assume the phone number is already available to the function.\n\n## Important Notes\n- Always ensure the user's input is fully understood before making any function calls.\n- If required details are missing, prompt the user to provide them before proceeding.\n\nRemember that all replies should be returned in plain text. Do not return markdown!",
  },
  sk1: {
    S: "apartmentSearchUseCase",
  },
  title: {
    S: "Apartment Search",
  },
  tools: {
    S: '[{"type":"function","function":{"name":"LiveAgentHandoffFunction","description":"Initiates a handoff to a live agent based on user request or sensitive topics.","parameters":{"type":"object","properties":{"reason":{"type":"string","description":"The reason for the handoff, such as user request, legal issue, financial matter, or other sensitive topics."},"context":{"type":"string","description":"Any relevant conversation context or details leading to the handoff."}},"required":["reason"]}}},{"type":"function","function":{"name":"SendAppointmentConfirmationSmsFunction","description":"Sends an SMS confirmation for a scheduled tour to the user.","parameters":{"type":"object","properties":{"appointmentDetails":{"type":"object","properties":{"date":{"type":"string","description":"The date of the scheduled tour (YYYY-MM-DD)."},"time":{"type":"string","description":"The time of the scheduled tour (e.g., \'10:00 AM\')."},"type":{"type":"string","enum":["in-person","self-guided"],"description":"The type of tour (either in-person or self-guided)."},"apartmentType":{"type":"string","enum":["studio","one-bedroom","two-bedroom","three-bedroom"],"description":"The type of apartment for the tour."}},"required":["date","time","type","apartmentType"]}},"required":["appointmentDetails"]}}},{"type":"function","function":{"name":"ScheduleTourFunction","description":"Schedules a tour for the user at the apartment complex.","parameters":{"type":"object","properties":{"date":{"type":"string","description":"The date the user wants to schedule the tour for (YYYY-MM-DD)."},"time":{"type":"string","description":"The time the user wants to schedule the tour for (e.g., \\"10:00 AM\\")."},"type":{"type":"string","enum":["in-person","self-guided"],"description":"The type of tour, either in-person or self-guided."},"apartmentType":{"type":"string","enum":["studio","one-bedroom","two-bedroom","three-bedroom"],"description":"The layout of the apartment the user is interested in."}},"required":["date","time","type","apartmentType"]}}},{"type":"function","function":{"name":"CheckAvailabilityFunction","description":"Checks the availability of tour slots based on the user\'s preferences.","parameters":{"type":"object","properties":{"date":{"type":"string","description":"The date the user wants to check for tour availability (YYYY-MM-DD)."},"time":{"type":"string","description":"The time the user wants to check for availability (e.g., \\"10:00 AM\\")."},"type":{"type":"string","enum":["in-person","self-guided"],"description":"The type of tour, either in-person or self-guided."},"apartmentType":{"type":"string","enum":["studio","one-bedroom","two-bedroom","three-bedroom"],"description":"The layout of the apartment the user is interested in."}},"required":["date","type","apartmentType"]}}},{"type":"function","function":{"name":"ListAvailableApartmentsFunction","description":"Lists available apartments based on optional user criteria.","parameters":{"type":"object","properties":{"date":{"type":"string","description":"The move-in date the user prefers (optional, YYYY-MM-DD)."},"budget":{"type":"integer","description":"The budget the user has for rent per month (optional)."},"apartmentType":{"type":"string","enum":["studio","one-bedroom","two-bedroom","three-bedroom"],"description":"The layout of the apartment the user is interested in (optional)."}},"required":[]}}},{"type":"function","function":{"name":"CheckExistingAppointmentsFunction","description":"Retrieves the list of appointments already booked.","parameters":{"type":"object","properties":{},"required":[]}}},{"type":"function","function":{"name":"CommonInquiriesFunction","description":"Handles common inquiries such as pet policy, fees, and other complex details, with the option to specify the apartment type.","parameters":{"type":"object","properties":{"inquiryType":{"type":"string","enum":["pet policy","fees","parking","specials","income requirements","utilities"],"description":"The type of inquiry the user wants information about."},"apartmentType":{"type":"string","enum":["studio","one-bedroom","two-bedroom","three-bedroom"],"description":"The apartment type for which the inquiry is being made (optional)."}},"required":["inquiryType"]}}}]',
  },
};

console.log(JSON.stringify(useCase));

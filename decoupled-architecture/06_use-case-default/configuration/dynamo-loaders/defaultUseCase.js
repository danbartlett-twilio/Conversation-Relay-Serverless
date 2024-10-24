/**
 * restaurantOrderingUseCase.js
 * 
 * This is a DynamoDB JSON file used to load data into the DynamoDB instance.
 * 
 * The command to load this item is in the "command-..." file in
 * the parent directory of this stack.
 * 
 */

let useCase = 
{
  "pk": {
    "S": "defaultUseCase"
  },
  "sk": {
    "S": "configuration"
  },
  "conversationRelayParams": {
    "M": {
      "dtmfDetection": {
        "BOOL": true
      },
      "interruptByDtmf": {
        "BOOL": true
      },
      "ttsProvider": {
        "S": "google"
      },
      "voice": {
        "S": "en-US-Journey-O"
      },
      "welcomeGreeting": {
        "S": "Thank you for calling into the Twilio Conversation Relay demo! Are you ready to begin?"
      }
    }
  },
  "dtmfHandlers": {
    "S": "{\"0\":{\"replyWithText\":true,\"replyText\":\"You pressed 0.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"1\":{\"replyWithText\":true,\"replyText\":\"You pressed 1.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"2\":{\"replyWithText\":true,\"replyText\":\"You pressed 2.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"3\":{\"replyWithText\":true,\"replyText\":\"You pressed 3.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"4\":{\"replyWithText\":true,\"replyText\":\"You pressed 4.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"5\":{\"replyWithText\":true,\"replyText\":\"You pressed 5.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"6\":{\"replyWithText\":true,\"replyText\":\"You pressed 6.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"7\":{\"replyWithText\":true,\"replyText\":\"You pressed 7.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"8\":{\"replyWithText\":true,\"replyText\":\"You pressed 8.\",\"replyWithFunction\":false,\"replyFunction\":\"\"},\"9\":{\"replyWithText\":true,\"replyText\":\"You pressed 9.\",\"replyWithFunction\":false,\"replyFunction\":\"\"}}"
  },
  "pk1": {
    "S": "use-case"
  },
  "prompt": {
    "S": "## Objective\nYou are a voice AI agent helping users get set up to try a voice AI demo platform powered by Twilio. Since this is a voice application, all responses should be in plain text. Do not use markdown or any additional formatting.\n\n<<USER_CONTEXT>>\n\nIf does not appear below, you need to first ask for the user's first and last name and the call a tool to save those details.\n\nNext, list out the available demo experiences and ask the user which one they want to try.\n\nThe available demo experiences are listed below with three lines each. The first line is the title of the demo. Use the title when initially listing the options. The second line is the description which you can use if the user asks for more details. The third line is the key to pass to the tool call once the user has made their choice. Do not inject any special characters like asterisks (*) into the title or desription. When reading the title, just use the exact text provided. Use a short pause after reading the title of each demo.\n\n<<AVAILABLE_DEMOS>>\n\nSave their answer to the demo experience using a tool call.\n\nOnce that tool completes, instruct the user to hang up and then call back to try out the demo."
  },
  "sk1": {
    "S": "defaultUseCase"
  },
  "tools": {
    "S": "[{\"type\":\"function\",\"function\":{\"name\":\"DefaultSaveFirstAndLastName\",\"description\":\"Saves a user's first and last name.\",\"parameters\":{\"type\":\"object\",\"properties\":{\"firstName\":{\"type\":\"string\",\"description\":\"The user's first name.\"},\"lastName\":{\"type\":\"string\",\"description\":\"The user's last name.\"}},\"required\":[\"firstName\",\"lastName\"]}}},{\"type\":\"function\",\"function\":{\"name\":\"DefaultSaveUseCase\",\"description\":\"Saves the use case that a user selects.\",\"parameters\":{\"type\":\"object\",\"properties\":{\"useCase\":{\"type\":\"string\",\"description\":\"The use case that a user selects.\"}},\"required\":[\"useCase\"]}}}]"
  }
};

console.log(JSON.stringify(useCase));
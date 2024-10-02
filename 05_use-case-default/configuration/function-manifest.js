/**
 * function-manifest.js
 * 
 * These are the functions that are available for this USE CASE.
 * The LLM can call these functions as needed.
 * 
 * This is a very simple node script that will just "stringify"
 * the functions and send them to console.log. You can copy and
 * paste the output and then add it to the appropriate DynamoDB
 * record for the use case.
 * 
 * run this command:
 * 
 * node ./function-manifest.js
 * 
 * ...from the command line in this directory to get the output
 */

let tools = [
    {
        type: "function",
        function: {
          name: "DefaultSaveFirstAndLastName",
          description:
            "Saves a user's first and last name.",
          parameters: {
            type: "object",
            properties: {
              firstName: {
                type: "string",
                description:
                  "The user's first name.",
              },
              lastName: {
                type: "string",
                description:
                  "The user's last name.",
              },              
            },
            required: ["firstName","lastName"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "DefaultSaveUseCase",
          description:
            "Saves the use case that a user selects.",
          parameters: {
            type: "object",
            properties: {
              useCase: {
                type: "string",                
                description:
                  "The use case that a user selects.",
              }
            },
            required: ["useCase"],
          },
        },
      }      

];

console.log(JSON.stringify(tools));
/**
 * handle-prompt.mjs
 * 
 * This module formats the prompt, calls the OpenAI LLM, handles and 
 * formats the streamed response, and returns a results object.
 */
import OpenAI from "openai";
const openai = new OpenAI( { apiKey: process.env.OPENAI_API_KEY } );

// Needed to stream text responses back to Twilio (via WebSockets)
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export async function handlePrompt(promptObj) {

    let model = (process.env.LLM_MODEL) ? process.env.LLM_MODEL : "gpt-4-turbo";

    // SET THE PROMPT TO OPENAI
    const prompt = {
        messages: promptObj.messages,
        model: model,
        stream: true        
      };

    let tool_choice = (promptObj?.tool_choice) ? promptObj?.tool_choice : "auto";
    // tool_choice can be string or object
    // string => none, auto, required
    // object => {"type": "function", "function": {"name": "my_function"}}

    if (!promptObj.toolCallCompletion) {
        prompt.tools = JSON.parse(promptObj.callConnection.tools)
        prompt.tool_choice = tool_choice;
    }

    let returnObj = {};
    returnObj.role = "assistant";
    returnObj.content = "";    
    returnObj.tool_calls = {};
    returnObj.refusal = null;
    
    // Instantiate WebSocket client to return text to Twilio
    const ws_client = promptObj.ws_client;
    
    /*const ws_client = new ApiGatewayManagementApiClient( {
        endpoint: `https://${promptObj.ws_endpoint}`
    });*/

    let currentToolCallId = null; // Needed to support multiple tool calls

    let i = 0; // Keep track of iterations if needed

    // call open AI and wait for response...
    const stream = await openai.chat.completions.create(prompt);
    
    // Iterate over stream
    for await (const chunk of stream) {
        
        i++;
        
        /**
         * TODO
         * 
         * HANDLE INTERRUPT
         * 
         * Check if interrupt has been called
         * => get db record
         * => check timestamp of interrupt
         * => if interrupt, call:
         * stream.controller.abort()
         * 
         */

        // IF TOOL CALL...
        if (chunk.choices[0]?.delta?.tool_calls) {            

            const currentToolCall = chunk.choices[0]?.delta?.tool_calls[0];

            // Set id of tool to be able to capture stream of arguments
            // because tool id is not passed is all chunks.                 
            if (currentToolCall.id !== undefined) {
                currentToolCallId = currentToolCall.id;                          
            } 

            // Add an object for tool call the first time we see it
            if (!returnObj.tool_calls[currentToolCall.id]) {                            
                           
                returnObj.tool_calls[currentToolCall.id] = {
                    id: currentToolCall.id,
                    type: "function",
                    function: {
                        name: currentToolCall.function.name,
                        arguments: ""    
                    }
                }

            }        
              
            // Append arguments to current tool_call object
            if (currentToolCall?.function?.arguments !== "") {
                //console.info(`Appending arguments for tool ${currentToolCallId} ==> ${returnObj.tool_calls[currentToolCallId].arguments}`);
                returnObj.tool_calls[currentToolCallId].function.arguments = returnObj.tool_calls[currentToolCallId].function.arguments + currentToolCall.function.arguments;
            }

            // finish_reason should be "tool_calls"
            returnObj.finish_reason = chunk.choices[0]?.finish_reason;            

        } else {

            // RETURNING TEXT FROM ASSISTANT
            //console.info(`TEXT RESPONSE chunk: \n` + JSON.stringify(chunk, null, 2));
            
            // Check if the completion has finished to set "last"
            let last = (chunk.choices[0]?.finish_reason === 'stop') ? true : false;        
        
            // Send content (current chunk content) back to WebSocket & Twilio for TTS
            await ws_client.send(new PostToConnectionCommand({
                Data: Buffer.from(JSON.stringify({type:"text", token:chunk.choices[0]?.delta?.content, last:last})),
                ConnectionId: promptObj.ws_connectionId,             
            }));        

            // Record details from current chunk
            returnObj.content += chunk.choices[0]?.delta?.content || '';
            returnObj.last = last;
            returnObj.finish_reason = chunk.choices[0]?.finish_reason;

        }

        i++;
    }
    
    // Check for property added at beginning of stream
    // Race condition at beginning of tool_call can create
    // an extraneous "arguments" entry in returnObj.tool_calls
    // This check just deletes it if it exists
    if (returnObj.tool_calls.hasOwnProperty('undefined')) {
        delete returnObj.tool_calls['undefined'];
    }

    /* If this is a tool call, format the results for
    // additional downstream processing and invoke State Machine
    if (Object.keys(returnObj.tool_calls).length > 0 ) {
        // Send content (current chunk content) back to WebSocket & Twilio for TTS
        ws_client.send(new PostToConnectionCommand({
            Data: Buffer.from(JSON.stringify({type:"text", token:"okay, I'll get that for you.", last:true})),
            ConnectionId: promptObj.ws_connectionId,              
        }));
    }*/

    console.info("In Handle Prompt about to return...\n" + JSON.stringify(returnObj, null, 2)); 

    return returnObj;
    
}   

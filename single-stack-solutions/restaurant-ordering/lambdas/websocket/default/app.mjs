/**
 *  app.js -- default Handler
 * 
 * Handles inbound websocket messages from ConversationRelay server
 * and handles tool completion events passed in from SNS.
 * 
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";

// Code for this lambda broken into several modules 
import { prepareAndCallLLM } from './prepare-and-call-llm.mjs';
import { savePrompt } from './database-helpers.mjs';
import { makeFunctionCalls } from './functions/make-function-calls.mjs';

export const lambdaHandler = async (event, context) => {    

    console.info("EVENT\n" + JSON.stringify(event, null, 2));    

    let connectionId = event.requestContext.connectionId;
    let ws_domain_name = event.requestContext.domainName;
    let ws_stage = event.requestContext.stage;
    let body = JSON.parse(event.body);
    let toolCallCompletion = false;

    // Get the core details from this connection (included user context,
    // use case, configuration details)
    const callConnection = await ddbDocClient.send( new GetCommand( { TableName: process.env.TABLE_NAME, Key: { pk: connectionId, sk: "connection" } } ));

    // Instantiate WebSocket client to return text to Twilio
    // This client can be used in this lambda and/or passed
    // to other modules.
    const ws_client = new ApiGatewayManagementApiClient( {
        endpoint: `https://${ws_domain_name}/${ws_stage}`
    });    

    try {

        // Text prompts and dtmf events sent via WebSockets 
        // and tool call completion events follow the same steps and call the LLM
        if (body?.type === "prompt" || body?.type === "dtmf") {                        

            const llmResult = await prepareAndCallLLM({
                ddbDocClient: ddbDocClient, 
                connectionId: connectionId, 
                callConnection: callConnection, 
                ws_client: ws_client, 
                ws_domain_name: ws_domain_name, 
                ws_stage: ws_stage, 
                body: body, 
                toolCallCompletion: toolCallCompletion
            });
                

            console.info("llmResult\n" + JSON.stringify(llmResult, null, 2));

            // Format the llmResult into a chat message to persist to the database
            let newAssistantChatMessage = {
                role: "assistant",
                content: llmResult.content,
                refusal: llmResult.refusal
            };
            
            // If tool_calls are present, convert the tool call object to
            // an array to adhere to llm chat messaging format
            if (Object.keys(llmResult.tool_calls).length > 0 ) {
                // Format tool_calls object into an array
                newAssistantChatMessage.tool_calls = Object.values(llmResult.tool_calls);
            }

            //console.info("newChatMessage before saving to dynamo\n" + JSON.stringify(newAssistantChatMessage, null, 2));    

            // Save LLM result prompt to the database            
            await savePrompt(ddbDocClient, connectionId, newAssistantChatMessage);

            // If the LLM Results includes tool call(s), format the results 
            // and make the tool calls
            if (Object.keys(llmResult.tool_calls).length > 0 ) {
                
                // Invoke State Machine to call tool(s)
                let toolCallResult = await makeFunctionCalls(ddbDocClient, llmResult.tool_calls, connectionId, callConnection, ws_domain_name, ws_stage);

                // Upon successfully running the tool calls...
                if (toolCallResult) {

                    toolCallCompletion = true;

                    // Tool Call(s) successfully completed so 
                    // call the LLM a second time.
                    await prepareAndCallLLM({
                        ddbDocClient: ddbDocClient, 
                        connectionId: connectionId, 
                        callConnection: callConnection, 
                        ws_client: ws_client, 
                        ws_domain_name: ws_domain_name, 
                        ws_stage: ws_stage, 
                        body: null, 
                        toolCallCompletion: toolCallCompletion
                    }); 

                }
            }

        } else if (body?.type === "interrupt") {

            /**
             * "interrupt" event sent by the ConversationRelay server when the user speaks 
             * before the text-to-speech has completed.
             * 
             * {
             *  "type" : "interrupt",
             *  "utteranceUntilInterrupt": "Life is a complex set of",
             *  "durationUntilInterruptMs": "460"
             * }
             * 
             * This implementation does not track interruptions.
             * 
             */

            // PUT records
            // pk = event.requestContext.connectionId 
            // sk = interrupt
            // ts = unix timestamp
     
        } else if (body?.type === "setup") {

            /**
             * "setup" event sent from ConversationRelay server as initial session message.
             * This event can be used for additional configuration for this call.
             * 
             * {
             *  "type": "setup",
             *  "sessionId": "VX8f1ae211b0404ab3905b4aa470bb9a36",
             *  "callSid": "CA3327b12c071c64297e9ea5108e0a9b29",
             *  "parentCallSid": null,
             *  "from": "+14085551212",
             *  "to": "+18881234567",
             *  "forwardedFrom": null,
             *  "callerName": null,
             *  "direction": "inbound",
             *  "callType": "PSTN",
             *  "callStatus": "IN-PROGRESS",
             *  "accountSid": "ACe6ee4b20287adb6e5c9ec4169b56d2bb",
             *  "applicationSid": "AP3c07638b2397e5e3f1e459fb1cc10000"
             * }
             * 
             * This implementation does utilize the setup event.
             */
            
            // PUT record
            // pk = event.requestContext.connectionId 
            // sk = setup
            
        } else if (body?.type === "end") {

            /**
             * "end" event is the last message sent by the ConversationRelay server. This
             * message can be used for any "clean up" processing.
             * 
             * {
             *  "type" : "end",
             *  "handoffData": "{\"reasonCode\":\"live-agent-handoff\", \"reason\": \"The caller wants to talk to a real person\"}"
             * }
             * 
             * This implementation does not use the end event.
             */

            // PUT record
            // pk = event.requestContext.connectionId 
            // sk = end
            
        }
    
        return { statusCode: 200, body: 'Completed.' };

    } catch (error) {
        
        console.log("Default Route app.js generated an error => ", error);
        
        return { statusCode: 500, body: 'Default app.js generated an error: ' + JSON.stringify(error) };

    }  

};
/**
 * handle-prompt.mjs
 *
 * This module formats the prompt, calls the OpenAI LLM, handles and
 * formats the streamed response, and returns a results object.
 */
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Needed to stream text responses back to Twilio (via WebSockets)
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { replyToWS } from "./reply-to-ws.mjs";

export async function handlePrompt(promptObj) {
  let model = process.env.LLM_MODEL ? process.env.LLM_MODEL : "gpt-4o-mini"; // "gpt-4-turbo";

  console.log("handle-prompt promptObj:", promptObj);

  // SET THE PROMPT TO OPENAI
  const prompt = {
    messages: promptObj.messages,
    model: model,
    stream: true,
  };

  let tool_choice = promptObj?.tool_choice ? promptObj?.tool_choice : "auto";
  // tool_choice can be string or object
  // string => none, auto, required
  // object => {"type": "function", "function": {"name": "my_function"}}

  // Provide the tools available for the LLM to call
  if (!promptObj.toolCallCompletion) {
    prompt.tools = JSON.parse(promptObj.callConnection?.tools);
    prompt.tool_choice = tool_choice;
  }

  // Instantiate the object that LLM returns.
  let returnObj = {};
  returnObj.role = "assistant";
  returnObj.content = "";
  returnObj.tool_calls = {};
  returnObj.refusal = null;

  // Declare WebSocket client to return text to Twilio
  // Client is instantiated in parent lambda.
  const ws_client = promptObj.ws_client;

  // Will be undefined is PSTN call
  const ui_ws_client = promptObj?.ui_ws_client;
  const uiConnection = promptObj?.uiConnection;

  let currentToolCallId = null; // Needed to support multiple tool calls

  let i = 0; // Keep track of iterations if needed

  // call open AI and wait for response...
  const stream = await openai.chat.completions.create(prompt);

  // Iterate over stream
  for await (const chunk of stream) {
    i++;

    /**
     *
     * INTERRUPTION HANDLING
     *
     * ConversationRelay handles interruptions.
     * If additional interruption handling is needed,
     * it could be handled here by periodically
     * checking a sesion flag that gets set on
     * an interruption generated by a SEPARATE event. The
     * flag would allow active event handlers (like this
     * function) to abort ==> stream.controller.abort()
     * Again, ConversationRelay has interruption handling
     * so additional logic likely is not needed but it could
     * be done here.
     *
     */

    // LLM is going to return tool_calls or text

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
            arguments: "",
          },
        };
      }

      // Append arguments to current tool_call object
      if (currentToolCall?.function?.arguments !== "") {
        //console.info(`Appending arguments for tool ${currentToolCallId} ==> ${returnObj.tool_calls[currentToolCallId].arguments}`);
        returnObj.tool_calls[currentToolCallId].function.arguments =
          returnObj.tool_calls[currentToolCallId].function.arguments +
          currentToolCall.function.arguments;
      }

      // finish_reason should be "tool_calls"
      returnObj.finish_reason = chunk.choices[0]?.finish_reason;
    } else {
      // RETURNING TEXT FROM ASSISTANT
      //console.info(`TEXT RESPONSE chunk: \n` + JSON.stringify(chunk, null, 2));

      // Check if the completion has finished to set "last"
      let last = chunk.choices[0]?.finish_reason === "stop" ? true : false;

      // Send content (current chunk content) back to WebSocket & Twilio for TTS
      await replyToWS(ws_client, promptObj.ws_connectionId, {
        type: "text",
        token: chunk.choices[0]?.delta?.content,
        last: last,
      });

      // Return LLM Responses to UI here if UI connection exists
      if (ui_ws_client && uiConnection?.Item?.uiConnId) {
        await replyToWS(ui_ws_client, uiConnection.Item.uiConnId, {
          type: "text",
          token: chunk.choices[0]?.delta?.content,
          last: last,
        });
      }

      // Record details from current chunk
      returnObj.content += chunk.choices[0]?.delta?.content || "";
      returnObj.last = last;
      returnObj.finish_reason = chunk.choices[0]?.finish_reason;
    }

    i++;
  }

  // Check for property added at beginning of stream
  // Race condition at beginning of tool_call can create
  // an extraneous "arguments" entry in returnObj.tool_calls
  // This check just deletes it if it exists
  if (returnObj.tool_calls.hasOwnProperty("undefined")) {
    delete returnObj.tool_calls["undefined"];
  }

  console.info(
    "In Handle Prompt about to return...\n" + JSON.stringify(returnObj, null, 2)
  );

  // Return Tool Call to UI Client
  if (
    returnObj.finish_reason === "tool_calls" &&
    returnObj.tool_calls[currentToolCallId].function?.name
  ) {
    if (ui_ws_client && uiConnection?.Item?.uiConnId) {
      await replyToWS(ui_ws_client, uiConnection.Item.uiConnId, {
        type: "functionCall",
        token: `Detected new tool call: ${returnObj.tool_calls[currentToolCallId].function?.name} with arguments: ${returnObj.tool_calls[currentToolCallId].function?.arguments}`,
      });
    }
  }

  return returnObj;
}

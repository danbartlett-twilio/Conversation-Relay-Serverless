/**
 *  app.js -- default Handler
 *
 * Handles inbound websocket messages from ConversationRelay server
 * and handles tool completion events passed in from SNS.
 *
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);
import { replyToWS } from "./reply-to-ws.mjs";

async function sendMessage(data, ws_client, connId) {
  console.log(
    "sending message: " +
      JSON.stringify(data) +
      "\nto ui websocket with connId: " +
      connId
  );
  await replyToWS(ws_client, connId, data);
}
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";

// Code for this lambda broken into several modules
import { prepareAndCallLLM } from "./prepare-and-call-llm.mjs";
import { savePrompt } from "./database-helpers.mjs";
import { makeFunctionCalls } from "./functions/make-function-calls.mjs";

export const lambdaHandler = async (event, context) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));

  let connectionId = event.requestContext.connectionId;
  let ws_domain_name = event.requestContext.domainName;
  let ws_stage = event.requestContext.stage;
  let ui_ws_domain_name =
    process.env.UI_WS_API + ".execute-api.us-east-1.amazonaws.com";
  let ui_ws_stage = "prod";
  let body = JSON.parse(event.body);
  let toolCallCompletion = false;

  const callConnection = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { pk: connectionId, sk: "finalConnection" },
    })
  );

  const ws_client = new ApiGatewayManagementApiClient({
    endpoint: `https://${ws_domain_name}/${ws_stage}`,
  });

  if (body.type === "setup") {
    console.log("uiConnID is: " + body.customParameters.uiConnId);
    let putItem = {
      pk: event.requestContext.connectionId,
      sk: "uiConnection",
      uiConnId: body.customParameters.uiConnId,
    };

    console.log(
      "put new websocket conn and CR conn Item: " + JSON.stringify(putItem)
    );
    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: putItem,
      })
    );
  }

  const uiConnection = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { pk: connectionId, sk: "uiConnection" },
    })
  );
  let ui_ws_client;
  if (uiConnection != null) {
    ui_ws_client = new ApiGatewayManagementApiClient({
      endpoint: `https://${ui_ws_domain_name}/${ui_ws_stage}`,
    });
    sendMessage(body, ui_ws_client, uiConnection.Item?.uiConnId);
  }

  try {
    // Text prompts and dtmf events sent via WebSockets
    // and tool call completion events follow the same steps and call the LLM
    if (body?.type === "prompt" || body?.type === "dtmf") {
      // adding ui_client
      const llmResult = await prepareAndCallLLM({
        ddbDocClient: ddbDocClient,
        connectionId: connectionId,
        callConnection: callConnection,
        ui_ws_client: ui_ws_client,
        uiConnection: uiConnection,
        ws_client: ws_client,
        ws_domain_name: ws_domain_name,
        ws_stage: ws_stage,
        body: body,
        toolCallCompletion: toolCallCompletion,
      });

      console.info("llmResult\n" + JSON.stringify(llmResult, null, 2));

      // Format the llmResult into a chat message to persist to the database
      let newAssistantChatMessage = {
        role: "assistant",
        content: llmResult.content,
        refusal: llmResult.refusal,
      };

      // ui_messages.push({ type: "text", token: llmResult.content });

      // If tool_calls are present, convert the tool call object to
      // an array to adhere to llm chat messaging format
      if (Object.keys(llmResult.tool_calls).length > 0) {
        // Format tool_calls object into an array
        newAssistantChatMessage.tool_calls = Object.values(
          llmResult.tool_calls
        );
      }

      //console.info("newChatMessage before saving to dynamo\n" + JSON.stringify(newAssistantChatMessage, null, 2));

      // Save LLM result prompt to the database
      await savePrompt(ddbDocClient, connectionId, newAssistantChatMessage);

      // If the LLM Results includes tool call(s), format the results
      // and make the tool calls
      if (Object.keys(llmResult.tool_calls).length > 0) {
        // Invoke State Machine to call tool(s)
        let toolCallResult = await makeFunctionCalls(
          ddbDocClient,
          llmResult.tool_calls,
          connectionId,
          callConnection,
          ws_domain_name,
          ws_stage
        );

        // Upon successfully running the tool calls...
        if (toolCallResult) {
          toolCallCompletion = true;

          // Tool Call(s) successfully completed so
          // call the LLM a second time.
          await prepareAndCallLLM({
            ddbDocClient: ddbDocClient,
            connectionId: connectionId,
            callConnection: callConnection,
            ui_ws_client: ui_ws_client,
            uiConnection: uiConnection,
            ws_client: ws_client,
            ws_domain_name: ws_domain_name,
            ws_stage: ws_stage,
            body: null,
            toolCallCompletion: toolCallCompletion,
          });
        }
      }
    } else if (body?.type === "interrupt") {
    } else if (body?.type === "end") {
    } else if (body?.type === "setup") {
    } else if (body?.type === "end") {
    }

    return { statusCode: 200, body: "Completed." };
  } catch (error) {
    console.log("Default Route app.js generated an error => ", error);
    return {
      statusCode: 500,
      body: "Default app.js generated an error: " + JSON.stringify(error),
    };
  }
};

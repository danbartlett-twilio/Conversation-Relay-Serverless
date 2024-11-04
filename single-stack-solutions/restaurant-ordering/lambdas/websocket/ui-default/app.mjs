/**
 *  app.js -- default Handler
 *
 * Handles inbound websocket messages from ConversationRelay server
 * and handles tool completion events passed in from SNS.
 *
 */
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export const lambdaHandler = async (event, context) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));

  let body = JSON.parse(event.body);
  let connectionId = event.requestContext.connectionId;
  let ws_domain_name = event.requestContext.domainName;
  let ws_stage = event.requestContext.stage;
  let toolCallCompletion = false;

  try {
    if (body?.type === "setup") {
      const ws_client = new ApiGatewayManagementApiClient({
        endpoint: `https://${ws_domain_name}/${ws_stage}`,
      });

      console.log(
        "websocket endpoint:  " + `https://${ws_domain_name}/${ws_stage}`
      );

      let setupMessage = {
        type: "setup",
        token: connectionId,
      };

      console.log("sending setupMessage: " + JSON.stringify(setupMessage));
      await ws_client.send(
        new PostToConnectionCommand({
          Data: Buffer.from(JSON.stringify(setupMessage)),
          ConnectionId: connectionId,
        })
      );
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

/**
 * CRUD for Configuration Use Cases
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {
  // TODO — switch case event.httpmethod to perform CRUD operations with using dbClient object
  console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));

  const requestBody = JSON.parse(event.body);
  console.log(requestBody);

  // update config
  try {
    // const requestBody = JSON.parse(event.body);
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: { pk: requestBody.pk, sk: "configuration" },
      UpdateExpression:
        "set #prompt = :prompt, #cr.#wg = :wg, #cr.#tts = :tts, #cr.#voice = :voice",
      ExpressionAttributeNames: {
        "#prompt": "prompt", // Replace 'AttributeName' with the attribute you want to update
        "#cr": "conversationRelayParams",
        "#wg": "welcomeGreeting",
        "#tts": "ttsProvider",
        "#voice": "voice",
      },
      ExpressionAttributeValues: {
        ":prompt": requestBody.prompt, //event.prompt,
        ":tts": requestBody.conversationRelayParams.ttsProvider,
        ":voice": requestBody.conversationRelayParams.voice,
        // ":title": requestBody.title, //event.title,
        ":wg": requestBody.conversationRelayParams.welcomeGreeting,
      },
      // Item: event,
      ReturnValues: "ALL_NEW",
    };

    const updatedConfig = await ddbDocClient.send(new UpdateCommand(params));

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };

    // Return the updated config to react client
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(updatedConfig.Attributes),
    };
  } catch (err) {
    console.log("Error using handling call => ", err);
    return false;
  }
};

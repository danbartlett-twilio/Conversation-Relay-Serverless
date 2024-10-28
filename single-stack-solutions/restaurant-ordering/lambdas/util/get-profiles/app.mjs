/**
 * get-profiles
 *
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  BatchWriteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {
  try {
    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));

    // refactor to take in phone number lookup to return profile
    const user = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: "+16477782422", sk: "profile" },
      })
    );

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };

    // Return the user to react client
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(user),
    };
  } catch (err) {
    console.log("Error using handling call => ", err);
    return false;
  }
};
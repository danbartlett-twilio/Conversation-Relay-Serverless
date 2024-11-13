/**
 * CRUD for Configuration Use Cases
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  BatchWriteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {
  // TODO — switch case event.requestContext.http.method to perform CRUD operations with using dbClient object
  console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));

  // if (event.requestContext.http.method === "GET") {
  //   const body = await getAllConfig();
  //   console.log(body);
  //   return body;
  // } else {
  //   const body = updateConfig(event);
  //   console.log(body);
  //   return body;
  // }

  // getAllConfig
  try {
    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));

    const params = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "pk1 = :c",
      ExpressionAttributeValues: {
        ":c": "use-case",
      },
    };

    const config = await ddbDocClient.send(new ScanCommand(params));

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };

    // Return the config to react client
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(config),
    };
  } catch (err) {
    console.log("Error using handling call => ", err);
    return false;
  }
};

const getAllConfig = async () => {
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "pk1 = :c",
      ExpressionAttributeValues: {
        ":c": "use-case",
      },
    };

    const config = await ddbDocClient.send(new ScanCommand(params));

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };

    // Return the config to react client
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(config),
    };
  } catch (err) {
    console.log("Error using handling call => ", err);
    return false;
  }
};

const updateConfig = async (event) => {
  try {
    console.log(`update Config function. event : “${event}”`);

    const requestBody = JSON.parse(event.body);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { pk: requestBody.pk, sk: "configuration" },
      // Item: marshall(requestBody || {}),
    };

    console.log(params);

    // If an item that has the same primary key as the new item already exists in the specified table, the new item completely replaces the existing item.
    // const createResult = await ddbClient.send(new PutItemCommand(params));
    // const createResult = await ddbClient.send(new UpdateCommand(params));

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };

    // Return the config to react client
    return {
      statusCode: 200,
      headers: headers,
      // body: JSON.stringify(createResult),
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

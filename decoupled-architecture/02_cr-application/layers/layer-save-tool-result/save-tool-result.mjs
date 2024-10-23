import { PutCommand } from "@aws-sdk/lib-dynamodb";

async function saveToolResult(ddbDocClient, evt, toolResult) {

  let finalResult = { 
    role: "tool", 
    tool_call_id: evt.id,
    content: JSON.stringify(toolResult)
  };        

  // Persist the current prompt so it is included 
  // in subsequent calls.
  await ddbDocClient.send(
      new PutCommand({
          TableName: process.env.TABLE_NAME,
          Item: {
              pk: evt.ws_connectionId,
              sk: `chat::${Date.now().toString()}${evt.id.slice(-5)}`, // add last 5 chars of tool_call_id.slice(-5) ensure unique
              chat: finalResult,
              expireAt:  parseInt((Date.now() / 1000) + 86400)  // Expire "demo" session data automatically (can be removed)
          }
      })
  );

  return true;

}

export  { saveToolResult };
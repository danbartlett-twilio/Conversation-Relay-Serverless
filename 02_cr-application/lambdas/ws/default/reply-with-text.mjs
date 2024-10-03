/**
 * reply-with-text.mjs
 * 
 * This module allows the program to reply with text to the ConversationRelay
 * Service to be converted to speech for the user. The Websocket client
 * is instantiated in the parent lambda and passed in here.
 */

// Needed to stream text responses back to Twilio (via WebSockets)
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export async function replyWithText(ws_client, replyObj) {

    await ws_client.send(new PostToConnectionCommand({
        Data: Buffer.from(JSON.stringify({type:"text", token: replyObj.text, last:replyObj.last})),        
        ConnectionId: replyObj.ws_connectionId,             
    }));        

    return true;
    
}   
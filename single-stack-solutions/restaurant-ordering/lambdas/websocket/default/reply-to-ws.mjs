/**
 * reply-with-text.mjs
 * 
 * This module allows the program to reply with text to the ConversationRelay
 * Service to be converted to speech for the user. The Websocket client
 * is instantiated in the parent lambda and passed in here.
 */

// Needed to stream text responses back to Twilio (via WebSockets)
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export async function replyToWS(ws_client, ws_connectionId, replyObj) {

    await ws_client.send(new PostToConnectionCommand({
        Data: Buffer.from(JSON.stringify(replyObj)),        
        ConnectionId: ws_connectionId,             
    }));        

    return true;
    
}   
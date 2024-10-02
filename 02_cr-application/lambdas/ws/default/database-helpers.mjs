import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export async function savePrompt(ddbDocClient, connectionId, newChatMessage) {
    // Persist the current prompt so it is included 
    // in subsequent calls.
    let result = await ddbDocClient.send(
        new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                pk: connectionId,
                sk: `chat::${Date.now().toString()}`,
                chat: newChatMessage,
                expireAt:  parseInt((Date.now() / 1000) + 86400)  // Expire "demo" session data automatically (can be removed)
            }
        })
    );

    return result;   
};

export async function returnAllChats(ddbDocClient, connectionId) {
    
    const chatsRaw = await ddbDocClient.send(new QueryCommand({ 
        TableName: process.env.TABLE_NAME, 
        KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)", 
        ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' }, 
        ExpressionAttributeValues: { ':pk': connectionId, ':sk': "chat::" } } )); 

    // Format these messages to be ingested by LLM
    //const messages = chatsRaw.Items.map(chat => {                
    return chatsRaw.Items.map(chat => {                        
        return { ...chat.chat };
    });     

}
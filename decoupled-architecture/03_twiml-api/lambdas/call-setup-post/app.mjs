/**
 * call-setup-post
 * 
 * Handle inbound call and set up <ConversationRelay></ConversationRelay>
 * 
 */

import querystring from 'node:querystring';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, BatchWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
const dynClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynClient);

export const lambdaHandler = async (event, context) => {     
    
    /**
     * 1) Parse BODY of request to extract Call Details
     * 2) Use From number to look up user record (if exists)
     * 3) Determine model to use
     * 4) PUT db record with event.requestContext.requestId as pk
     * 5) Create ws url adding cid param using event.requestContext.requestId
     * 6) Generate Twiml to spin up ConversationRelay connection
     */
    
    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));    
    
    // 1) Parse BODY of request to extract Call Details
    
    let bufferObj = Buffer.from(event.body, "base64");    
    let twilio_body = querystring.decode(bufferObj.toString("utf8"));

    console.info("twilio_body ==>\n" + JSON.stringify(twilio_body, null, 2));    
    
    // 2) Use From number to look up user record (if exists)    
    const user = await ddbDocClient.send( new GetCommand( { TableName: process.env.TABLE_NAME, Key: { pk: twilio_body.From, sk: "profile" } } ));
    let userContext = "";
    if (user.Item) {
        userContext = user.Item;
    }

    console.info("user.Item ==>\n" + JSON.stringify(user.Item, null, 2));    

    // 3) Determine use case and params to use   
    const useCaseTitle = (user?.Item?.useCase) ? user?.Item?.useCase : "defaultUseCase";
    
    const useCase = await ddbDocClient.send( new GetCommand( { TableName: process.env.TABLE_NAME, Key: { pk: useCaseTitle, sk: "configuration" } } ));

    let prompt = useCase.Item.prompt;

    if (user.Item) {
        let rString = `The name of the person you are talking to is ${user.Item.firstName} ${user.Item.lastName}. You can use this person's first name. If needed, their phone number is ${twilio_body.From}.`;
        if (user.Item.email) {
            rString = rString + ` Their email address is ${user.Item.email} -- you may offer to send emails.`;
        } else {
            rString = rString + ` You do not have their email address so cannot offer to send emails.`
        }
        prompt = prompt.replace('<<USER_CONTEXT>>', rString);
    } else {
        prompt = prompt.replace('<<USER_CONTEXT>>', `First ask for the user's first and last name and then call a tool to save those details.`);
    }
    
    if (useCase.Item.pk === "defaultUseCase") {
        // Pull in available demos so user can choose.
        const demosRaw = await ddbDocClient.send(new QueryCommand({ 
            TableName: process.env.TABLE_NAME,
            IndexName: "index-1-full",
            KeyConditionExpression: "#pk1 = :pk1", 
            ExpressionAttributeNames: { '#pk1': 'pk1' }, 
            ExpressionAttributeValues: { ':pk1': 'use-case' } } ));     
        let demos = demosRaw.Items.map((demo, index) => {                
            if (demo.pk !== "defaultUseCase") {                
                return `#${index+1}. ${demo.title}\n${demo.description}\n${demo.pk}\n`;                
            }
        });         
        console.info("demos ==>\n", demos);    
        prompt = prompt.replace('<<AVAILABLE_DEMOS>>', demos.join(""));            
    }

    console.info("useCase.Item ==>\n" + JSON.stringify(useCase?.Item, null, 2));    

    // Params for the Conversation Relay Twilio TwiML tag are saved in 
    // an object for the use case record. Each property of the object
    // will be injected into the TwiML tag below. Allows for Params
    // to be pulled in dynamically
    let conversationRelayParams = useCase.Item.conversationRelayParams
    
    // DTMF Handlers are passed into the session from the use case configuration
    // but can be changed dynamically during the session!
    let dtmfHandlers = useCase.Item.dtmfHandlers;

    // This is the function "manifest", or all tools available to call
    // This can be changed dynamically during the session!
    let tools = useCase.Item.tools;

    try {

        // 4) Add DB Records to establish a "session"
        // The pk is event.requestContext.requestId which is also passed to
        // the WebSocket connection to tie this initial request to the 
        // WebSocket connection.

        // This item contains core data for the session
        let connectionItem = {
            pk: event.requestContext.requestId,
            sk: "connection",
            useCase: useCaseTitle,
            userContext: userContext,
            tools: tools, // tools passed into session -- can be changed dynamically.
            dtmfHandlers: dtmfHandlers, // dtmf handlers passed into session -- can be changed dynamically.
            expireAt: Math.floor(Date.now() / 1000) + 120, // Delete Record after 2 minutes
            ...twilio_body,            
        };
        
        // This is the prompt to use and the first chat message
        // This prompt could be altered dynamically BEFORE this step
        
        let timeZone = "America/Los_Angeles";  // Edit to your specifications or could be dynamic based on user
        
        const currentDate = new Date();
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZone: timeZone
        });
        
        prompt = prompt.replace('<<CURRENT_DATE>>', dateFormatter.format(currentDate));

        let promptItem = {
            pk: event.requestContext.requestId,
            sk: `chat::${Date.now().toString()}`,
            chat: {
                role: "system",
                content: prompt
            },
            expireAt: Math.floor(Date.now() / 1000) + 120, // Delete Record after 2 minutes            
        };

        let putRequests = [
            { PutRequest: { Item: connectionItem } },
            { PutRequest: { Item: promptItem } }
        ];        

        // Persits items to the database
        await ddbDocClient.send(new BatchWriteCommand({ RequestItems: { [process.env.TABLE_NAME]:putRequests } }));
        
        // 5) Create ws url adding cid param using event.requestContext.requestId
        // This requestId param allows the call set up to be connected to
        // the WebSocket session (connectionId)
        
        let ws_url = `${process.env.WS_URL}?cid=${event.requestContext.requestId}`;
        
        // 6) Generate Twiml to spin up ConversationRelay connection        

        // Pull out params ==> Could be dynamic for language, tts, stt...
        let conversationRelayParamsString = "";
        for (const [key, value] of Object.entries(conversationRelayParams)) {
            conversationRelayParamsString += `${key}="${value}" `;
            console.log(`${key}: ${value}`);
        }

        let twiml = `<?xml version="1.0" encoding="UTF-8"?><Response>    
    <Connect>
        <ConversationRelay url="${ws_url}" ${conversationRelayParamsString} />
    </Connect>
</Response>`;
        
        console.log("twiml ==> ", twiml);

        // Return the twiml to Twilio
        return {
            'statusCode': 200,headers: {'Content-Type': 'application/xml'},
            body: twiml
        };

    } catch (err) {

        console.log("Error using handling call => ", err);                
        return false

    }        
        
};
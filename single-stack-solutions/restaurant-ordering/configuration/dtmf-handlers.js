/**
 * dtmf-handlers.js
 * 
 * These are the functions that are available for this USE CASE.
 * The LLM can call these functions as needed.
 * 
 * This is a very simple node script that will just "stringify"
 * the functions and send them to console.log. You can copy and
 * paste the output and then add it to the appropriate DynamoDB
 * record for the use case.
 * 
 * run this command:
 * 
 * node ./dtmf-handlers.js
 * 
 * ...from the command line in this directory to get the output
 * 
 * replyWith Options:
 *  text => just reply with words
 *  function => call a tool call
 *  textAndFunction => reply with words AND a tool call
 */

let dtmfHandlers = {
    "1": {"replyWithText":true, "replyText":"You pressed 1.", "replyWithFunction":false, "replyFunction":""},
    "2": {"replyWithText":true, "replyText":"You pressed 2.", "replyWithFunction":false, "replyFunction":""},
    "3": {"replyWithText":true, "replyText":"You pressed 3.", "replyWithFunction":false, "replyFunction":""},
    "4": {"replyWithText":true, "replyText":"You pressed 4.", "replyWithFunction":false, "replyFunction":""},
    "5": {"replyWithText":true, "replyText":"You pressed 5.", "replyWithFunction":false, "replyFunction":""},
    "6": {"replyWithText":true, "replyText":"You pressed 6.", "replyWithFunction":false, "replyFunction":""},
    "7": {"replyWithText":true, "replyText":"You pressed 7.", "replyWithFunction":false, "replyFunction":""},
    "8": {"replyWithText":true, "replyText":"You pressed 8.", "replyWithFunction":false, "replyFunction":""},
    "9": {"replyWithText":true, "replyText":"You pressed 9.", "replyWithFunction":false, "replyFunction":""},
    "0": {"replyWithText":true, "replyText":"You pressed 0.", "replyWithFunction":false, "replyFunction":""}
};


console.log(JSON.stringify(dtmfHandlers));
/**
 *  twilio-send-message
 *
 *
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// import twilio from "twilio";
// const twilioClient = twilio(accountSid, authToken); //not able to import properly
const twilioClient = require("twilio")(accountSid, authToken); //not able to import properly

// export const lambdaHandler = async (event, context) => {
exports.lambdaHandler = async function (event, context) {
  let snsPayload = JSON.parse(event.Records[0].Sns.Message);

  console.info("EVENT\n" + JSON.stringify(event, null, 2));
  console.info("Message\n" + JSON.stringify(snsPayload, null, 2));
  try {
    // Format and execute api call to Twilio
    const messageResponse = await twilioClient.messages.create({
      to: snsPayload.To,
      from: snsPayload.From,
      body: snsPayload.MessageBody,
    });
    return true;

    console.log("messageResponse => ", messageResponse);
  } catch (e) {
    console.log("error sending message", e);
    return false;
  }
};

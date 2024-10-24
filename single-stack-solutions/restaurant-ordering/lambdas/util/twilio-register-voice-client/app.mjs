/**
 * voice-client-register
 * register voice token from client
 */

import Twilio from "twilio";
const AccessToken = Twilio.jwt.AccessToken;
const VoiceGrant = Twilio.jwt.AccessToken.VoiceGrant;

export const lambdaHandler = async (event, context) => {
  try {
    console.info("EVENT ==>\n" + JSON.stringify(event, null, 2));

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.API_SECRET,
      { identity: "test:conversationRelay" }
    );

    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });
    accessToken.addGrant(grant);

    console.log(accessToken.toJwt());

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };

    // Include identity and token in a JSON response
    return {
      statusCode: 200,
      headers: headers,
      body: accessToken.toJwt(),
    };
  } catch (err) {
    console.log("Error using handling call => ", err);
    return false;
  }
};

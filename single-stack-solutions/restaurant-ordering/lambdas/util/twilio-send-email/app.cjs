/**
 *  twilio-send-email
 * 
 *
 */

// SendGrid Client (from Lambda Layer)
const mail = require('@sendgrid/mail');   
               
exports.lambdaHandler = async function (event, context) { 

  let snsPayload = JSON.parse(event.Records[0].Sns.Message);  

  console.info("EVENT\n" + JSON.stringify(event, null, 2));    
  console.info("Message\n" + JSON.stringify(snsPayload, null, 2));    

  try {

    // This could be made dynamic if sending from 
    // multiple SendGrid accounts.
    mail.setApiKey(process.env.SENDGRID_API_KEY);    
    
    // Simple example that could be easily extended to
    // include dynamic templates and add categories, custom arguments
    // an more => https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send
    let emailObject = {
      to: snsPayload.to_email,
      from: process.env.TWILIO_EMAIL_FROM_ADDRESS,
      subject: snsPayload.subject,
      content: [{type:"text/html", value:snsPayload.html}]
    };

    // Call SendGrid
    let response = await mail.send(emailObject);

    console.log("response ==> ", response);

    return true;
  
  } catch (err) {

    console.log("Error calling SendGrid API => ", err);

  }

};
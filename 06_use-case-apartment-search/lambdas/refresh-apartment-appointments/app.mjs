/**
 *  add-apartment-appointments
 * 

 */
import { getFutureDate, returnRandomData }  from "/opt/random-data-generator.mjs";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);       

async function saveAppointment (appointment) {
  
  console.log("appointment ==> ", appointment);

  await ddbDocClient.send(
    new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: appointment
  }));  

  return;

}

export const lambdaHandler = async (event, context) => {    

  console.info("EVENT\n" + JSON.stringify(event, null, 2));    

  let daysOut = (event.config?.daysOut) ? event.config.dayOut : 7;

  let appointments = []; // appointments to be loaded
    
  let daysOutArray = Array.from({ length: daysOut }, (value, index) => index);

  let dayOptions = [
    {apartmentType: "studio", appointmentType: "self-guided"},
    {apartmentType: "studio", appointmentType: "in-person"},
    {apartmentType: "one-bedroom", appointmentType: "self-guided"},
    {apartmentType: "one-bedroom", appointmentType: "in-person"},    
    {apartmentType: "two-bedroom", appointmentType: "self-guided"},
    {apartmentType: "two-bedroom", appointmentType: "in-person"},        
    {apartmentType: "three-bedroom", appointmentType: "self-guided"},
    {apartmentType: "three-bedroom", appointmentType: "in-person"}
  ];

  try {
    
    await Promise.all(daysOutArray.map(async (daysOut) => {
      
      let date = await getFutureDate((daysOut+1), "en-CA", null);
      
      dayOptions.map(async (dayOption) => {
        
        let time = await returnRandomData("times");
        
        appointments.push({
          pk: "availableApartmentAppointments",
          sk: `${date}::${time}::${dayOption.apartmentType}::${dayOption.appointmentType}`,
          appointment: {
            apartmentType: dayOption.apartmentType,
            date: date,
            time: time,
            type: dayOption.appointmentType
          },
          expireAt: parseInt((Date.now() / 1000) + (86400 * (daysOut+1)) )  // Expire "appointment" day off automatically (can be removed keeps data clean)          
        })
      });

    }));

    console.info("appointments ==> \n" + JSON.stringify(appointments, null, 2));

    await Promise.all(appointments.map(async (appointment) => {
              
      await saveAppointment(appointment);

    }));     

    return true;

  } catch (error) {
        
    console.log("Error failed create appointments => ", error);
    
    return { statusCode: 500, body: 'Failed to complete: ' + JSON.stringify(error) };

  }    

};
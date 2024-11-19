let userProfile = {
  pk: {
    S: "client:test:conversationRelay",
  },
  sk: {
    S: "profile",
  },
  firstName: {
    S: "firstName", // replace with your name
  },
  lastName: {
    S: "lastName", // replace with your name
  },
  messagingServiceSid: {
    S: "MGXXXXXXXXXXX", //replace with either a twilio phone number in e.164 formart or a twilio messaging service sid - this is in order to receive SMS confirmation from client
  },
  personal_phone: {
    S: "+16477782422", //replace with your phone number you would like to receive SMS from
  },
  pk1: {
    S: "profile",
  },
  sk1: {
    S: "client:test:conversationRelay",
  },
  useCase: {
    S: "apartmentSearchUseCase",
  },
};

console.log(JSON.stringify(userProfile));

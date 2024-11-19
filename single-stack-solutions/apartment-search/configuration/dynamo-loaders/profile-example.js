/**
 * apartmentSearchUseCase.js
 * 
 * This is a DynamoDB JSON file used to load data into the DynamoDB instance.
 * 
 * The command to load this item is in the "command-..." file in
 * the parent directory of this stack.
 * 
 */

let userProfile = 
{
  "pk": {
    "S": "+15555555555"
  },
  "sk": {
    "S": "profile"
  },
  "email": {
    "S": "email@twilio.com"
  },
  "firstName": {
    "S": "Dan"
  },
  "lastName": {
    "S": "Twilio"
  },
  "pk1": {
    "S": "profile"
  },
  "sk1": {
    "S": "+15555555555"
  },
  "useCase": {
    "S": "apartmentSearchUseCase"
  }
};

console.log(JSON.stringify(userProfile));
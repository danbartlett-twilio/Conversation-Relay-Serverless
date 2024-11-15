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
    "S": "+17048193222"
  },
  "sk": {
    "S": "profile"
  },
  "email": {
    "S": "mvickstrom@twilio.com"
  },
  "firstName": {
    "S": "Mark"
  },
  "lastName": {
    "S": "Vickstrom"
  },
  "pk1": {
    "S": "profile"
  },
  "sk1": {
    "S": "+17048193222"
  },
  "useCase": {
    "S": "apartmentSearchUseCase"
  }
};

console.log(JSON.stringify(userProfile));
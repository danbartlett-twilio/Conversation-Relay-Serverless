/**
 * apartmentSearchUseCase.js
 *
 * This is a DynamoDB JSON file used to load data into the DynamoDB instance.
 *
 * The command to load this item is in the "command-..." file in
 * the parent directory of this stack.
 *
 */

let userProfile = {
  pk: {
    S: "+1XXXXXXXXXX", // replace with your personal number
  },
  sk: {
    S: "profile",
  },
  email: {
    S: "name@example.com", // replace with your email
  },
  firstName: {
    S: "firstName", // replace with your name
  },
  lastName: {
    S: "lastName", // replace with your name
  },
  pk1: {
    S: "profile",
  },
  sk1: {
    S: "+1XXXXXXXXXX", // replace with your personal number
  },
  useCase: {
    S: "apartmentSearchUseCase",
  },
};

console.log(JSON.stringify(userProfile));

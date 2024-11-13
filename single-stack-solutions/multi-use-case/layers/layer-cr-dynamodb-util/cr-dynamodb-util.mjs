// Function to build dynamic expressions for UpdateItem
// Takes in object with fields and breaks keys and values
// into the necessary parts for the UpdateItem operation
// Essentially this function formats an update express.
async function buildDynExpressions(fields) {
  
    let returnObj = {
      updateExpression: "",
      expressionAttributeNames: {},
      expressionAttributeValues: {}
    };

    // Construct update expression
    const updateExpressions = [];

    Object.keys(fields).forEach((field) => {
      updateExpressions.push(`#${field} = :${field}`);
    });

    returnObj.updateExpression = "SET " + updateExpressions.join(", ");

    // Construct attribute names and values
    Object.keys(fields).forEach((field) => {
      const value = fields[field];
      const namePlaceholder = `#${field}`;
      const valuePlaceholder = `:${field}`;
      returnObj.expressionAttributeNames[namePlaceholder] = field;
      returnObj.expressionAttributeValues[valuePlaceholder] = value;
    });  

  return returnObj;

}

export  { 
  buildDynExpressions
};
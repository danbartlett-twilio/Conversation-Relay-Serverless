// Import the AWS SDK for JavaScript v2
import AWS from 'aws-sdk';

// Set the AWS Region
const REGION = process.env.AWS_REGION

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient({ region: REGION });

// Lambda handler function
export const lambdaHandler = async (event, context) => {
  console.log("getCalls event: " + JSON.stringify(event));
  const params = {
    TableName:  process.env.TABLE_NAME,
    FilterExpression: '#sk = :skVal',
    ExpressionAttributeNames: {
      '#sk': 'sk',
      '#Called': 'Called' 
    },
    ExpressionAttributeValues: {
      ':skVal': 'connection'
    },
    ProjectionExpression: "Caller, #Called, CallSid, expireAt"
  };

  try {
    const data = await ddb.scan(params).promise();
    console.log('Success', data.Items);
    return { statusCode: 200, body: JSON.stringify(data.Items) };
  } catch (err) {
    console.error('Error', err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
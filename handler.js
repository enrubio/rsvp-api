'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/* POST /guests */
module.exports.submitGuest = async (event) => {
	const requestBody = JSON.parse(event.body);
  const firstName = requestBody.firstName;
  const lastName = requestBody.lastName;
  const responded = requestBody.responded;

	if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof responded !== 'boolean') {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      },
      body: JSON.stringify({
        message: `Validation failed. Invalid input type(s).`,
      })
    }
  }

	const guest = guestItem(firstName, lastName, responded);

  await putGuest(guest);  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    },
    body: JSON.stringify({
      message: `Added ${firstName} ${lastName}`,
    })
  }
}

/* Puts guest in dynamo table */
const putGuest = async (guest) => {
  const guestItem = {
    TableName: process.env.GUESTS_TABLE,
    Item: guest,
  };
  
    await dynamoDb.put(guestItem).promise();
    return guest;
}

/* Creates a guest item */
const guestItem = (firstName, lastName, responded) => {
	return {
    id: uuid.v1(),
    'firstName': firstName,
    'lastName': lastName,
    'responded': responded,
  };
};

/* GET /guests */
module.exports.listGuests = async (event) => {
  let params = {
    TableName: process.env.GUESTS_TABLE,
    ProjectionExpression: "id, firstName, lastName, responded"
  };

  const data = await dynamoDb.scan(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    },
    body: JSON.stringify({
      message: data.Items
    })
  }
}

/* POST /responses/accept */
module.exports.submitResponse = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    },
    body: JSON.stringify({
      message: 'This lambda works',
      input: event.body,
    }),
  };
}

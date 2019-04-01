'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/* POST /responses/accept */
module.exports.submitResponse = async (event) => {
  const requestBody = JSON.parse(event.body);
  const {
    guestUuid,
    firstName,
    lastName,
    attending,
    dietaryRestrictions,
    additionalGuests,
    guests
  } = requestBody;

  if (typeof guestUuid !== 'string' ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof attending !== 'boolean' ||
    typeof dietaryRestrictions !== 'string' ||
    typeof additionalGuests !== 'number' ||
    Array.isArray(guests) === false) {
    return buildResponse(400, 'Validation failed. Invalid input type(s)')
  }

  const response = buildResponseItem(guestUuid, firstName, lastName, attending, dietaryRestrictions, additionalGuests, guests);

  await putResponse(response);
  return buildResponse(200, response)
}

/* Puts response in dynamo table */
const putResponse = async function putResponseInDynamo(response) {
  const responseItem = {
    TableName: process.env.RESPONSES_TABLE,
    Item: response,
  }

  await dynamoDb.put(responseItem).promise();
  return response;
}

/* Creates response item */
const buildResponseItem = function buildResponseItemDynamoModel(guestUuid, firstName, lastName, attending, dietaryRestrictions, additionalGuests, guests) {
  return {
    id: uuid.v1(),
    'guestUuid': guestUuid,
    'firstName': firstName,
    'lastName': lastName,
    'attending': attending,
    'dietaryRestrictions': dietaryRestrictions,
    'additionalGuests': additionalGuests,
    'guests': guests,
  }
}

/* GET /responses */
module.exports.listResponses = async (event) => {
  let params = {
    TableName: process.env.RESPONSES_TABLE,
    ProjectionExpression: `id, guestUuid, firstName, lastName, attending, dietaryRestrictions, additionalGuests, guests`
  };

  const data = await dynamoDb.scan(params).promise();

  return buildResponse(200, data.Items)
}

const buildResponse = function buildHttpResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    },
    body: JSON.stringify({
      message: message
    })
  }
}
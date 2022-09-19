'use strict'
const APIGateway = require('@aws-sdk/client-api-gateway')
const apiGatewayClient = new APIGateway.APIGateway({ region: process.env.REGION })
const path = require('path')

const { removeOrphanApiRest } = require('./apiManagerDB')

const handler = async (event, context) => {
  console.log('removeOrphanApiRest.js - handler => event:', event)

  await removeOrphanApiRest()
}

module.exports = {
  handler,
}

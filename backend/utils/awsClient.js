'use strict'
const AWS = require('aws-sdk')
const APIGatewayClient = require('@aws-sdk/client-api-gateway')

const DEFAULT_CONFIG = {
  region: process.env.REGION,
}

// AWS.events.on('error', function () {
//   console.log('this.response', this.response)
// })

module.exports = {
  api: new AWS.APIGateway({ ...DEFAULT_CONFIG }),
  S3: new AWS.S3({ ...DEFAULT_CONFIG }),
}

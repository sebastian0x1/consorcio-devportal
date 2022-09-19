'use strict'
const path = require('path')
const AWS = require('aws-sdk')

const fs = require('fs')

const BUCKET = process.env.S3_BUCKET_NAME
const STAGE = process.env.STAGE
const REGION = process.env.REGION
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID

const DEFAULT_CONFIG = {
  region: REGION,
}

const handler = async (event, context, callback) => {
  console.log('apiManager.js - handler')
  console.log('apiManager.js - handler => DB:', process.env.MYSQL_DATABASE)
  console.log('apiManager.js - handler => BUCKET:', BUCKET)

  let isFromAWSConfig = true
  let message = null
  let paramsLimit = null

  let configMessage = event?.invokingEvent
  //configMessage = await readMock() // TODO: delete!

  if (configMessage) configMessage = JSON.parse(configMessage)
  else isFromAWSConfig = false
  console.log('apiManager.js - handler => isFromAWSConfig:', isFromAWSConfig)
  if (isFromAWSConfig) {
    console.log('apiManager.js - handler => Triggered By Config')
    let configurationItem = configMessage?.configurationItem
    let messageType = configMessage?.messageType
    let resourceType = configurationItem?.resourceType
    let configurationItemStatus = configurationItem?.configurationItemStatus
    let resourceId = configurationItem?.resourceId

    message = {
      configurationItem,
      resourceType,
      configurationItemStatus,
      resourceId,
      messageType,
    }
    console.log('apiManager.js - handler => message:', message)
  } else {
    console.log('apiManager.js - handler => Manual or CRON trigger')
    paramsLimit = event?.paramsLimit ? event?.paramsLimit : null
    console.log('apiManager.js - handler => paramsLimit:', paramsLimit)
  }

  var params = {
    stateMachineArn: `arn:aws:states:${REGION}:${AWS_ACCOUNT_ID}:stateMachine:ApiChanges-${STAGE}`,
    input: `{ 
      "paramsLimit": ${paramsLimit},
      "isFromAWSConfig": ${isFromAWSConfig},
      "message": ${JSON.stringify(message)}
    }`,
  }

  //console.log('Params:', params)
  var stepfunctions = new AWS.StepFunctions({ ...DEFAULT_CONFIG })
  try {
    let requestResponse = await stepfunctions.startExecution(params).promise()
    console.log('Step-Function response:', JSON.stringify(requestResponse, null, 2))
  } catch (error) {
    console.error(error)
  }
  return 'Api manager finished'
}

async function readMock() {
  console.log('apiManager.js - readMock => Current path: ', process.cwd())
  let mock

  mock = fs.readFileSync('./apiManager/mocks/config_mock11.json', 'utf8')

  console.log('apiManager.js - readMock => Mock has been loaded')

  return mock
}

module.exports = {
  handler,
}

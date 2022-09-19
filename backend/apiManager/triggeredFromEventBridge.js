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
  console.log('TriggeredFromEventBridge.js - handler')
  console.log('TriggeredFromEventBridge.js - handler => DB:', process.env.MYSQL_DATABASE)
  console.log('TriggeredFromEventBridge.js - handler => BUCKET:', BUCKET)
  console.log('TriggeredFromEventBridge.js - handler => event:', event)
  console.log('TriggeredFromEventBridge.js - handler => event.Records:', event.Records)
  console.log('TriggeredFromEventBridge.js - handler => event.body:', event.body)
  console.log('TriggeredFromEventBridge.js - handler => event:', JSON.stringify(event, null, 2))
  console.log('TriggeredFromEventBridge.js - handler => context:', context)

  let isFromAWSConfig = true
  let message = null
  let paramsLimit = null

  let configMessage = JSON.parse(event?.Records?.[0]?.body ?? null)?.detail

  //configMessage = await readMock() // TODO: delete!

  if (!configMessage) isFromAWSConfig = false //configMessage = JSON.parse(configMessage)

  console.log('TriggeredFromEventBridge.js - handler => isFromAWSConfig:', isFromAWSConfig)
  if (isFromAWSConfig) {
    console.log('TriggeredFromEventBridge.js - handler => Triggered By Config')
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
    console.log('TriggeredFromEventBridge.js - handler => message:', message)
  } else {
    console.log('TriggeredFromEventBridge.js - handler => Triggered manually')
    paramsLimit = event?.paramsLimit ? event?.paramsLimit : null
    console.log('TriggeredFromEventBridge.js - handler => paramsLimit:', paramsLimit)
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
  console.log('TriggeredFromEventBridge.js - readMock => Current path: ', process.cwd())
  let mock

  mock = fs.readFileSync('./apiManager/mocks/config_mock11.json', 'utf8')

  console.log('TriggeredFromEventBridge.js - readMock => Mock has been loaded')

  return mock
}

module.exports = {
  handler,
}

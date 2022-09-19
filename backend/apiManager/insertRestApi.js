'use strict'
const AWS = require('aws-sdk')
const APIGateway = require('@aws-sdk/client-api-gateway')
//const apiGatewayClient = new APIGateway.APIGateway({ region: process.env.REGION })
const path = require('path')
const { addVpcE } = require('../utils/swaggerVpcConverter')

const md5 = require('md5')
const { s3UploadFile } = require('../utils/s3')
const { insertApiAndStageDB, updateApiDB } = require('./apiManagerDB')
const { getApiGatewayClient } = require('./getApiGClient')

const BUCKET = process.env.S3_BUCKET_NAME
const STAGE = process.env.STAGE

let apisFromDB = undefined

const tagPortalIdentifier = ['dev', 'test', 'prod'] //'CNTV.Chile' // TODO: estandarizar el valor del tag para identificar las cuentas miembros
const tagPortalKey = 'ambiente'

const handler = async (event, context) => {
  console.log('insertRestApi.js - handler => event:', JSON.stringify(event, null, 2))

  console.log('insertRestApi.js - handler => DB: ', process.env.MYSQL_DATABASE)
  console.log('insertRestApi.js - handler => BUCKET: ', BUCKET)

  let api = event[0]?.api
  apisFromDB = event[1]?.apisFromDB

  if (!api) return

  if (api.stages.length === 0) {
    console.warn(`\napiManager.js - registrationManagerRestApi => API ${api.name} - ID: ${api.id} ABORTED: WITHOUT STAGE`)
    return
    //await deleteRestApiAndS3File(api.id)
  }

  for (const stage of api.stages) {
    await checkToRegisterRestApi(api, stage)
  }
}

/**
 * Registers a RestApi in DB and S3. If it was already registered so
 * the current swagger will be compared with the new one. If they are
 * different then the new one will replace the old swagger.
 *
 * @param {{id: Number, name: String, createdAt: String}} api
 * @param {{name: String, createdAt: String, updatedAt: String}} stage
 */
async function checkToRegisterRestApi(api, stage) {
  console.log('insertRestApi.js - checkToRegisterRestApi => api Object: ', JSON.stringify(api))
  console.log(
    'insertRestApi.js - checkToRegisterRestApi => apiId: ',
    api.id,
    ' - apiName: ',
    api.name,
    ' - apiCreatedAt: ',
    api.createdAt,
    ' - stage: ',
    stage,
    ' - account: ',
    api.account
  )

  // Get the swagger json
  let jsonSwagger = await getJsonSwagger(api.id, stage.name, api.account)
  console.log('insertRestApi.js - checkToRegisterRestApi => jsonSwagger', jsonSwagger)

  // Generate MD5 hash
  let newHash = await md5(jsonSwagger)
  console.log('insertRestApi.js - checkToRegisterRestApi => newHash: ', newHash)

  // Check if DB has registered the restApiId, get the MD5 hash if exist
  let apiRestRecord = apisFromDB
    ? apisFromDB.find((apiDB) => apiDB.api_apiid === api.id && apiDB.stage_name.toLowerCase() === stage.name.toLowerCase())
    : null
  console.log('insertRestApi.js - checkToRegisterRestApi => apiRestRecord: ', apiRestRecord)

  // Get account tag
  const tag_account = await getAccountTag(api)

  // Get previous hash if exist
  let previousHash = apiRestRecord ? apiRestRecord.apis_stages_api_hash : null
  console.log('insertRestApi.js - checkToRegisterRestApi => prevHash:', previousHash)

  if (apiRestRecord) {
    // Check if the MD5 hash is different than previous
    console.log('apiManager.js - checkToRegisterRestApi => RestApi already existed')
    if (previousHash != newHash) {
      console.log('insertRestApi.js - checkToRegisterRestApi => RestApi change detected')

      // TODO: Check if stageName is the same
      let isInserted = await saveSwaggerApiS3(api.id, tag_account, stage.name.toLowerCase(), jsonSwagger)
      if (isInserted) await updateApiDB(api.id, stage.name, newHash, apiRestRecord.apis_stages_id)
      else console.error('insertRestApi.js - checkToRegisterRestApi => File not uploaded to S3')
    } else {
      console.log('insertRestApi.js - checkToRegisterRestApi => RestApi has not changed')
    }
  } else {
    console.log('insertRestApi.js - checkToRegisterRestApi => New RestApi detected')

    let isInserted = await saveSwaggerApiS3(api.id, tag_account, stage.name.toLowerCase(), jsonSwagger)
    if (isInserted) await insertApiAndStageDB(api, stage, newHash)
    else console.error('insertRestApi.js - checkToRegisterRestApi => File not uploaded to S3')
  }
}

/**
 * Gets json swagger from Api Gateway service
 *
 * @param {String} restApiId
 * @param {String} stage
 * @return {*}
 */
const getJsonSwagger = async (restApiId, stage, account) => {
  console.log('insertRestApi.js - getJsonSwagger')

  let params = {
    exportType: 'swagger',
    restApiId: restApiId,
    stageName: stage,
  }
  let jsonSwagger

  let apiGatewayClient = await getApiGatewayClient(account)

  let response = await apiGatewayClient.getExport(params).promise()
  console.log('insertRestApi.js - getJsonSwagger => response:', response.body)

  response.body = JSON.stringify(await addVpcE(JSON.parse(response.body)))

  jsonSwagger = response.body
  //jsonSwagger = new TextDecoder('utf-8').decode(JSON.stringify(response.body))

  return jsonSwagger
}

/**
 * Saves swagger API in S3
 *
 * @param {String} restApiId
 * @param {String} stage
 * @param {String} jsonSwagger
 */
async function saveSwaggerApiS3(restApiId, tag_account = 'default', stage, jsonSwagger) {
  console.log('insertRestApi.js => saveSwaggerApiS3')

  let s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: path.join('apis/', restApiId, tag_account, stage, 'swagger.json'),
    Body: jsonSwagger,
    ACL: 'private',
  }
  await s3UploadFile(s3Params)

  return true
}

async function getAccountTag(api) {
  try {
    const organizations = new AWS.Organizations({ region: process.env.REGION })
    let params = {
      ResourceId: api.account,
    }
    let accountDescription = await organizations.listTagsForResource(params).promise()
    console.log('accountDescription => ', accountDescription)
    const tag = accountDescription.Tags.find(
      (element) => element.Key === tagPortalKey && tagPortalIdentifier.includes(element.Value)
    )
    console.log('tag => ', tag)
    return tag?.Value
  } catch (error) {
    console.log('ERROR => ', error.message)
    return undefined
  }
}

module.exports = {
  handler,
  checkToRegisterRestApi,
}

'use strict'
const path = require('path')
const AWS = require('aws-sdk')
const sts = new AWS.STS()

const { getRestApisFromDB } = require('./apiManagerDB')
const { getPortalMembersAccounts } = require('./getAccounts')
const { getApiGatewayClient } = require('./getApiGClient')

const BUCKET = process.env.S3_BUCKET_NAME
const STAGE = process.env.STAGE
const SERVICE_NAME = process.env.SERVICE_NAME

let apisFromDB = undefined

const handler = async (event, context) => {
  console.log('getRestApis.js - handler => event:', event)
  console.log('getRestApis.js - handler => DB: ', process.env.MYSQL_DATABASE)
  console.log('getRestApis.js - handler => BUCKET: ', BUCKET)

  console.log('getRestApis.js - handler => Manual or CRON trigger')
  let paramsLimit = event?.paramsLimit
  let apiId = event?.result?.apiId ? event?.result?.apiId : ''
  let apiAccount = event?.result?.account
  console.log(`getRestApis.js - handler => paramsLimit: ${paramsLimit} - apiId: ${apiId} - account: ${apiAccount}`)
  let apisFromAwsAndDb = null

  try {
    apisFromAwsAndDb = await getRestApisFromDBAndAws({ apiId, paramsLimit, apiAccount })
  } catch (error) {
    console.error('getRestApis.js - handler => error:', error)
    let error_parsed = JSON.parse(error?.Cause)
    if (error_parsed?.errorMessage.includes('Invalid API identifier specified')) return
    else throw 'getRestApis.js - handler => apiGatewayClient failed'
  }
  return apisFromAwsAndDb
}

/**
 * Gets both rest Apis from DB and rest Apis from AWS to check if these last ones are registered
 *
 */
async function getRestApisFromDBAndAws({ apiId = '', paramsLimit, apiAccount }) {
  console.log('getRestApis.js - getRestApisFromDBAndAws')

  apisFromDB = await getRestApisFromDB(apiId)
  console.log('getRestApis.js - getRestApisFromDBAndAws => apisFromDB: ', JSON.stringify(apisFromDB, null, 2))

  let apisFromAws = await getAllRestApiFromAws({ apiId, paramsLimit, apiAccount })
  console.log('getRestApis.js - getRestApisFromDBAndAws => apisFromAws: ', JSON.stringify(apisFromAws, null, 2))

  if (!apisFromAws) return
  return {
    staff: {
      apisFromAws,
      apisFromDB,
    },
  }
}

/**
 * Gets all rest apis from AWS ApiGateway
 *
 * @return {Array.<{id: Number, name: String, stages: Array.<String>, createdAt: date}>}
 */
const getAllRestApiFromAws = async ({ apiId, paramsLimit, apiAccount }) => {
  console.log(`getRestApis.js - getAllRestApiFromAws => apiId: ${apiId} - paramsLimit: ${paramsLimit} - account: ${apiAccount}`)

  let apisWithStageArray = []

  let apisArray = []

  if (apiId) {
    let params = {
      restApiId: apiId,
    }

    let apiGatewayClient = await getApiGatewayClient(apiAccount)
    let api = await apiGatewayClient.getRestApi(params).promise()
    let account = {
      Id: apiAccount,
    }
    console.log('getRestApis.js - getAllRestApiFromAws => individual api:', api)

    if (!api) {
      console.log(`getRestApis.js - getAllRestApiFromAws => Abort, there are no Apis in AWS.`)
      return
    }
    if (api?.name.includes(SERVICE_NAME)) {
      console.log(`getRestApis.js - getAllRestApiFromAws => Abort, the service itself is removed.`)
      return
    }

    apisWithStageArray.push(await setStage(api, apiGatewayClient, account))
  } else {
    // buscar las cuentas miembro
    const portalMembersAccounts = await getPortalMembersAccounts()

    for (const account of portalMembersAccounts) {
      let apiGatewayClient
      ;({ apisArray, apiGatewayClient } = await getApisArray(account, paramsLimit))

      if (!apisArray || apisArray.length == 0) {
        console.log(`getRestApis.js - getAllRestApiFromAws => Abort, there are no Apis in AWS.`)
        continue
      }

      for (const api of apisArray) {
        apisWithStageArray.push(await setStage(api, apiGatewayClient, account))
      }
    }
  }
  console.log('getRestApis.js - getAllRestApiFromAws => apisWithStageArray:', apisWithStageArray)

  if (apisWithStageArray.length == 1 && apisWithStageArray[0].stages.length == 0) {
    console.log(`getRestApis.js - getAllRestApiFromAws => Abort, API does not have any stage.`)
    return
  }

  return apisWithStageArray
}

/**
 * Gets all the apis from an specific account
 *
 * @param {*} account
 * @return {Array.<{id: Number, name: String, createdAt: date, apiKeySource: String, endpointConfiguration: Object, disableExecuteApiEndpoint: boolean}>}
 */
const getApisArray = async (account, paramsLimit) => {
  let apiGatewayClient = await getApiGatewayClient(account.Id)

  let apisArray = []
  let params = {
    limit: paramsLimit,
    position: undefined,
  }
  apisArray = await apiGatewayClient.getRestApis(params).promise()

  params.position = apisArray?.position
  apisArray = apisArray.items ? apisArray.items : null
  console.log('getRestApis.js - getApisArray => Next position', params.position)

  let apisArrayPart
  while (params.position) {
    apisArrayPart = await apiGatewayClient.getRestApis(params)
    console.log('apisArrayPart', apisArrayPart)
    if (apisArrayPart.items) apisArray.push(...apisArrayPart.items)
    params.position = apisArrayPart?.position
    console.log('getRestApis.js - getApisArray => Next position', params.position)
  }

  return { apisArray, apiGatewayClient }
}

/**
 * Sets stage belonged to a rest api id
 *
 * @param {String} restApiId
 * @return {[String]} array
 */
const setStage = async (api, apiGatewayClient, account) => {
  let stagesArray = await getStages(api.id, apiGatewayClient)
  if (!api.name.includes(SERVICE_NAME)) {
    return {
      id: api.id,
      name: api.name,
      stages: stagesArray,
      createdAt: api.createdDate,
      account: account.Id,
    }
  }
}

/**
 * Gets stages belonged to a rest api id using the apiGateway client for that specific account
 *
 * @param {String} restApiId
 * @return {[String]} array
 */
const getStages = async (restApiId, apiGatewayClient) => {
  let stagesParams = {
    restApiId: restApiId,
  }

  let stages = await apiGatewayClient.getStages(stagesParams).promise()
  let stageArray = []

  if (stages && stages.item) {
    for (const stage of stages.item) {
      stageArray.push({
        name: stage.stageName,
        createdAt: stage.createdDate,
        updatedAt: stage.lastUpdatedDate,
      })
    }
  }

  return stageArray
}

module.exports = {
  handler,
  getAllRestApiFromAws,
}

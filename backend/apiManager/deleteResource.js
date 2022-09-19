const { deleteRestApiAndRelationFromDB, deleteApiStageRelationFromDB } = require('./apiManagerDB')
const { s3DeleteFile } = require('../utils/s3')

const BUCKET = process.env.S3_BUCKET_NAME
let apisFromDB = undefined

/**
 * Deletes either RestApi or Stage
 *
 */
async function handler(event, context) {
  console.log('deleteResource.js - handler => event:', event)

  let message = event?.message
  let apiId = message.resourceId.split('/')[2]

  if (message.resourceType.includes('RestApi')) {
    await deleteRestApi(apiId)
  } else {
    let apiStage = message.configurationItem?.resourceName
    await deleteStage(apiId, apiStage)
  }
}

/**
 * Deletes RestApi from DB and S3
 *
 * @param {String} apiId
 */
async function deleteRestApi(apiId) {
  console.log(`deleteResource.js - deleteRestApi => apiId: ${apiId}`)

  let isDeleted = await deleteRestApiAndRelationFromDB(apiId)
  if (isDeleted) await deleteSwaggerApiS3(apiId)
}

/**
 * Deletes RestApi's Stage from DB and S3
 *
 * @param {String} apiId
 * @param {String} apiStage
 */
async function deleteStage(apiId, apiStage) {
  console.log(`deleteResource.js - deleteStage => apiId: ${apiId} - apiStages: ${apiStage}`)

  let isDeleted = await deleteApiStageRelationFromDB(apiId, apiStage)
  if (isDeleted) await deleteSwaggerApiS3(apiId, apiStage)
}

/**
 * Deletes swagger API in S3
 *
 * @param {String} apiId
 * @param {String} stage
 */
async function deleteSwaggerApiS3(apiId, apiStage = '') {
  console.log(`deleteResource.js - deleteSwaggerApiS3 => apiId: ${apiId} - apiStages: ${apiStage}`)

  let s3Params = {
    Bucket: BUCKET,
    Key: 'apis/' + apiStage ? apiId + '/' + apiStage + '/swagger.json' : apiId,
  }

  console.log('deleteResource.js - deleteSwaggerApiS3 => S3 Path to delete', s3Params.Key)
  await s3DeleteFile(s3Params)
}

module.exports = {
  handler,
}

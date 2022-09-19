const { fetchSwaggerDocuments } = require('../utils/s3')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  let { stage, tag_account, api_apiid } = event.pathParameters
  console.log(`Retrieving Swagger from S3 for apiId '${api_apiid}' in stage '${stage}' with tag_account '${tag_account}'...`)

  try {
    let swaggerFile = await fetchSwaggerDocuments(api_apiid, tag_account, stage)

    // Set response
    let body = {
      api_apiid: api_apiid,
      api_swagger: swaggerFile,
    }

    // Set response
    return Responses.ok200(event.httpMethod, body, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, 'Error al cargar Swagger.', event.headers)
  }
}

module.exports = {
  handler,
}

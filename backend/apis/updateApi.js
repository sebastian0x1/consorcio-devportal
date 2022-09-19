const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')
const { s3CopyFile, s3DeleteFile } = require('../utils/s3')
const path = require('path')
const { checkDuplicateApi, parseBody } = require('./createApi')
const { ConnectParticipant } = require('aws-sdk')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Api ID
  let api_id = event.pathParameters.api_id

  if (!api_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al actualizar API ID: ${api_id}.`, event.headers)
  }

  const body = parseBody(event)
  console.log('Updating existing api => ', JSON.stringify(body))

  let isUnique = await checkDuplicateApi(body, api_id)

  const db = await dbConnection.connect()

  if (isUnique) {
    try {
      makeSchemaValidation(body, requestBodySchemas.apis.updateApi)
      let resp
      try {
        resp = await db.query(`SELECT api_apiid FROM apis WHERE api_id=?;`, [api_id])
      } catch (e) {
        console.log(e)
      } finally {
        db.quit()
      }

      let last_path = path.join('apis/', resp[0].api_apiid, body.last_path)
      let new_path = path.join('apis/', resp[0].api_apiid, body.api_tag_account_name, body.api_stage, 'swagger.json')

      if (last_path !== new_path) {
        let bucket = process.env.S3_BUCKET_NAME
        await s3CopyFile({
          Bucket: bucket,
          Key: new_path,
          CopySource: encodeURI(`${bucket}/${last_path}`),
        })

        await s3DeleteFile({
          Bucket: bucket,
          Key: last_path,
        })
      }

      await db
        .transaction()
        .query('UPDATE apis SET api_name=?, api_color=? WHERE api_id=?;', [body.api_name, body.api_color, api_id])
        .query('DELETE FROM apis_stages WHERE apis_stages_api_id=?;', [api_id])
        .query('INSERT INTO apis_stages (apis_stages_api_id, apis_stages_stage_id) VALUES (?, ?);', [api_id, body.api_stage_id])
        .query('DELETE FROM apis_tag_accounts WHERE apis_tag_accounts_api_id=?;', [api_id])
        .query('INSERT INTO apis_tag_accounts (apis_tag_accounts_tag_account_id, apis_tag_accounts_api_id) VALUES (?, ?);', [
          body.api_tag_account_id,
          api_id,
        ])
        .rollback((e) => {
          console.error('Rollback.Error => ', e)
        })
        .commit()

      // Set response
      return Responses.ok204(event.httpMethod, event.headers)
    } catch (e) {
      console.error('error => ', e)

      // Set response
      return Responses.error400(event.httpMethod, `Error al actualizar API ID: ${api_id}.`, event.headers)
    } finally {
      db.quit()
    }
  } else {
    return Responses.error409(event.httpMethod, 'El nombre de la api existe en este ambiente para esta versión.', event.headers)
  }
}

module.exports = {
  handler,
}

const path = require('path')
const dbConnection = require('../utils/dbConnection')
const { s3DeleteFile } = require('../utils/s3')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Api id
  let api_id = event.pathParameters.api_id
  console.log('Deleting api_id => ', api_id)

  if (!api_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al eliminar API ID: ${api_id}.`, event.headers)
  }
  const db = await dbConnection.connect()
  try {
    let api_apiid = null
    let tag_account_name = null
    let stage_name = null

    // Deleting API
    await db
      .transaction()
      .query(
        `SELECT
          api_apiid,
          stage_name,
          tag_account_name
        FROM apis
        JOIN apis_stages ON apis_stages_api_id=api_id
        JOIN stages ON stage_id=apis_stages_stage_id
        JOIN apis_tag_accounts ON apis_tag_accounts_api_id=api_id
        JOIN tag_accounts ON tag_account_id=apis_tag_accounts_tag_account_id
        WHERE api_id=?;
        `,
        [api_id]
      )
      .query((r) => {
        r = r.shift()
        api_apiid = r.api_apiid
        tag_account_name = r.tag_account_name
        stage_name = r.stage_name
        console.log('mysql.result', r)
        return null
      })
      .query('DELETE FROM apis WHERE api_id=?;', [api_id])
      .rollback((e) => {
        console.error('Rollback.Error => ', e)
      })
      .commit()
    db.quit()

    if (!api_apiid || !stage_name || !tag_account_name)
      throw new Error(`apiId or stage or tag_account_name is null for api_id=${api_id}`)

    // Delete file to s3
    await s3DeleteFile({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: path.join('apis/', api_apiid),
    })

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, `Error al eliminar API ID: ${api_id}.`, event.headers)
  }
}

module.exports = {
  handler,
}

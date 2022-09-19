const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all apis for business lines...')

  const db = await dbConnection.connect()

  try {
    let apiListForBs = await db.query(
      `
      SELECT
        api_id,
        api_name,
        stage_name AS api_stage,
        tag_account_id
      FROM apis
      JOIN apis_stages ON apis_stages_api_id=api_id
      JOIN stages ON apis_stages_stage_id=stage_id
      JOIN apis_tag_accounts ON apis_tag_accounts_api_id=api_id
      JOIN tag_accounts ON tag_account_id=apis_tag_accounts_tag_account_id;
      `
    )

    console.log('apiListForBs', apiListForBs)

    // Set response
    return Responses.ok200(event.httpMethod, apiListForBs, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, 'Error al cargar los datos.', event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

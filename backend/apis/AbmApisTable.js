const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all apis...')

  const db = await dbConnection.connect()
  try {
    let apiList = await db.query(
      `
      SELECT
      api_id,
        api_name,
        api_color,
        stage_id AS api_stage_id,
        stage_name AS api_stage,
        stage_color AS api_stage_color,
        tag_account_id AS api_tag_account_id,
        tag_name AS api_tag_account_name,
        tag_account_color AS api_tag_account_color,
        api_is_external,
        api_created_at,
        api_updated_at
      FROM apis
      JOIN apis_stages ON apis_stages_api_id=api_id
      JOIN stages ON apis_stages_stage_id=stage_id
      LEFT JOIN apis_tag_accounts ON apis_tag_accounts_api_id=api_id
      LEFT JOIN tag_accounts ON tag_account_id=apis_tag_accounts_tag_account_id
      LEFT JOIN tags ON tag_id=tag_account_name;
      `
    )

    // Set response
    return Responses.ok200(event.httpMethod, apiList, event.headers)
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

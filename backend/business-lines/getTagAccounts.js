const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all tagAccounts for business lines...')

  const db = await dbConnection.connect()

  try {
    let tagListForBs = await db.query(
      `
      SELECT
        tag_account_id, tag_account_name, tag_name, tag_account
      FROM tags 
      LEFT JOIN tag_accounts ON tag_account_name=tag_id;
      `
    )

    console.log('tagListForBs', tagListForBs)

    // Set response
    return Responses.ok200(event.httpMethod, tagListForBs, event.headers)
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

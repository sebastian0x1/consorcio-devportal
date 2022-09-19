const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all users...')

  const db = await dbConnection.connect()

  try {
    let usersList = await db.query(
      `
      SELECT
        user_id,
        user_role_id,
        role_name AS user_role_name,
        role_color AS user_role_color,
        user_name,
        user_email,
        user_id_cognito,
        user_active,
        user_created_at,
        user_updated_at
      FROM users
      LEFT JOIN roles ON user_role_id=role_id;
      `
    )

    console.log('usersList', JSON.stringify(usersList, null, 2))

    // Set response
    return Responses.ok200(event.httpMethod, usersList, event.headers)
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

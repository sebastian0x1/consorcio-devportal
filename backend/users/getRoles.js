const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all roles for users...')

  const db = await dbConnection.connect()

  try {
    let roleListForUsers = await db.query('SELECT role_id, role_name FROM roles;')

    console.log('roleListForUsers', roleListForUsers)

    // Set response
    return Responses.ok200(event.httpMethod, roleListForUsers, event.headers)
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

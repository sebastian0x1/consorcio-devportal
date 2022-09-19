const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all permissions for roles...')

  const db = await dbConnection.connect()

  try {
    let permissionsList = await db.query('SELECT permission_id, permission_name FROM permissions;')

    // Set response
    return Responses.ok200(event.httpMethod, permissionsList, event.headers)
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

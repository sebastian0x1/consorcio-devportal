const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Role ID
  let role_id = event.pathParameters.role_id
  console.log('Deleting role_id => ', role_id)

  if (!role_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al eliminar Role ID: ${role_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    await db.query('DELETE FROM roles WHERE role_id=?;', [role_id])

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, `Error al eliminar Role ID: ${role_id}.`, event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

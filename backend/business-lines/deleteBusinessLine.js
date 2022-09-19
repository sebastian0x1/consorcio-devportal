const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Business Line ID
  let business_line_id = event.pathParameters.business_line_id
  console.log('Deleting business_line_id => ', business_line_id)

  if (!business_line_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al eliminar Business Line ID: ${business_line_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    await db.query('DELETE FROM business_lines WHERE business_line_id=?;', [business_line_id])

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, `Error al eliminar Business Line ID: ${business_line_id}.`, event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all business lines for roles...')

  const db = await dbConnection.connect()

  try {
    let bsList = await db.query('SELECT business_line_id, business_line_name FROM business_lines;')

    // Set response
    return Responses.ok200(event.httpMethod, bsList, event.headers)
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

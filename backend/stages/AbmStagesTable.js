const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all stages for apis...')

  const db = await dbConnection.connect()

  try {
    let stagesList = await db.query('SELECT * FROM stages;')

    // console.log('stagesList', stagesList)

    // Set response
    return Responses.ok200(event.httpMethod, stagesList, event.headers)
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

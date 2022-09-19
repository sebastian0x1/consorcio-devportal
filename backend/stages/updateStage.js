const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Stage ID
  let stage_id = event.pathParameters.stage_id

  if (!stage_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al actualizar Stage ID: ${stage_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    // Body
    let body = JSON.parse(event.body)
    console.log('Updating existing stage => ', JSON.stringify(body))

    // Body validation
    makeSchemaValidation(body, requestBodySchemas.stages)

    // Update data
    await db.query('UPDATE stages SET stage_color=?, stage_active=? WHERE stage_id=?;', [
      body.stage_color,
      body.stage_active,
      stage_id,
    ])

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, `Error al actualizar Stage ID: ${stage_id}.`, event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

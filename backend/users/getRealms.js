const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all roles for users...')

  const db = await dbConnection.connect()

  try {
    let realms = await db.query(
      `SELECT CONCAT(realm_name, "-", s.stage_name) AS realm_name
             FROM realms r INNER JOIN stages s 
             ON s.stage_id = r.realm_stage`
    )

    // Set response
    return Responses.ok200(event.httpMethod, realms, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, 'Error al cargar los datos.', event.headers)
  } finally {
    db.quit()
  }
}

async function getRealm(body) {
  const db = await dbConnection.connect()
  try {
    let { realm_name, stage_name } = body
    let realmEndpoint = ''
    let realms = await db.query(
      `
        SELECT realm_endpoint 
        FROM realms r INNER JOIN stages s 
        ON s.stage_id = r.realm_stage
        WHERE r.realm_name = ? AND s.stage_name = ?;
        `,
      [realm_name, stage_name]
    )

    if (typeof realms !== undefined && realms.length > 0) realmEndpoint = realms.shift().realm_endpoint

    return realmEndpoint
  } catch (e) {
    console.error('error => ', e)
    return Responses.error400('Error al cargar los datos.')
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
  getRealm,
}

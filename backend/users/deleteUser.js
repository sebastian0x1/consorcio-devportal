require('dotenv').config()
const { poolData, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  let response = {
    statusCode: undefined,
    body: undefined,
    headers: undefined,
  }

  // Cognito ID
  let cognito_id = event.pathParameters.cognito_id
  console.log('Deleting user_coginto_id => ', cognito_id)

  if (!cognito_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al eliminar User IdCognito: ${cognito_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    await cognitoIdentityServiceProvider
      .adminDeleteUser({
        UserPoolId: poolData.UserPoolId,
        Username: cognito_id,
      })
      .promise()

    // Delete from DB
    await db.query(`DELETE FROM users WHERE user_id_cognito=?;`, [cognito_id])

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (error) {
    console.error(error)

    // Set response
    response.statusCode = 400
    response.body = JSON.stringify(`Error al eliminar User IdCognito: ${cognito_id}.`)

    // Set response
    return Responses.error400(event.httpMethod, `Error al eliminar User IdCognito: ${cognito_id}.`, event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

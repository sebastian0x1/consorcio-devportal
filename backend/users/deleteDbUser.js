require('dotenv').config()
const dbConnection = require('../utils/dbConnection')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  if (event.detail.eventName !== 'AdminDeleteUser') {
    console.log('No es una eliminación de usuario')
    return
  }

  let cognito_id = event.detail.additionalEventData.sub

  const db = await dbConnection.connect()

  try {
    const result = await db.query(`DELETE FROM users WHERE user_id_cognito=?;`, [cognito_id])
    console.log('result', JSON.stringify(result))
    console.log(`USUARIO ${cognito_id} ELIMINADO`)
  } catch (error) {
    console.error(error)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

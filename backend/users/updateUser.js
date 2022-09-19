require('dotenv').config()
const { poolData, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Cognito ID
  let cognito_id = event.pathParameters.cognito_id

  if (!cognito_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al actualizar User IdCognito: ${cognito_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    // Body
    let body = JSON.parse(event.body)

    // Body validation
    makeSchemaValidation(body, requestBodySchemas.users.updateUser)

    // Attribute list
    let attributeList = await setAttrs(body, db)

    // Update cognito
    await cognitoIdentityServiceProvider
      .adminUpdateUserAttributes({
        UserAttributes: attributeList,
        UserPoolId: poolData.UserPoolId,
        Username: cognito_id,
      })
      .promise()

    // Update database
    await updateUserToDb(
      {
        user_name: body.user_name,
        user_role_id: body.user_role_id,
        user_active: body.user_active,
        cognito_id: cognito_id,
      },
      db
    )

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (error) {
    console.error(error)

    // Set response
    return Responses.error400(event.httpMethod, `Error al actualizar User IdCognito: ${cognito_id}.`, event.headers)
  }
}

async function setAttrs({ user_name, user_role_id, user_active }, db) {
  let user_permissions_names = await getPermissionsForRole(user_role_id, db)
  user_permissions_names = user_permissions_names.shift()
  console.log('user_permissions_names', user_permissions_names, typeof user_permissions_names)

  if (user_permissions_names && user_permissions_names.permission_names)
    user_permissions_names = user_permissions_names.permission_names
  else user_permissions_names = ''

  // Attribute List
  let attributeList = []
  attributeList.push({ Name: 'name', Value: user_name })
  attributeList.push({ Name: 'custom:role_id', Value: String(user_role_id) })
  attributeList.push({ Name: 'custom:user_permissions', Value: user_permissions_names })
  attributeList.push({ Name: 'custom:user_active', Value: String(user_active) })

  return attributeList
}

async function getPermissionsForRole(role_id, db) {
  return db.query(
    `
    SELECT
      group_concat(permission_name) AS permission_names
    FROM permissions
    JOIN roles_permissions ON roles_permissions_permission_id=permission_id
    WHERE roles_permissions_role_id=?
    GROUP BY roles_permissions_role_id;
    `,
    [role_id]
  )
}

async function updateUserToDb(userData, db) {
  console.info('Update user in db')
  return db.query(`UPDATE users SET user_name=?, user_role_id=?, user_active=? WHERE user_id_cognito=?`, [
    userData.user_name,
    userData.user_role_id,
    userData.user_active,
    userData.cognito_id,
  ])
}

module.exports = {
  handler,
}

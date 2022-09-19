require('dotenv').config()
const jwt_decode = require('jwt-decode')
const dbConnection = require('../utils/dbConnection')
const { poolData, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const { createApiKey, getPermissionsForRole } = require('./createUser.js')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  const db = await dbConnection.connect()

  try {
    let { IDToken } = JSON.parse(event.body)
    let jwtDecoded = jwt_decode(IDToken)

    const user_sub_cognito = jwtDecoded['sub']
    const username = jwtDecoded['cognito:username']
    informationCognito = await FillUserData(user_sub_cognito, username, username, db)

    console.log('informationCognito', informationCognito)

    let body = {
      user_role: informationCognito.user_role,
      user_permissions: informationCognito.user_permissions,
    }

    return Responses.ok200(event.httpMethod, body, event.headers)
  } catch (error) {
    console.log('error', error)
    return Responses.error400(event.httpMethod, error, event.headers)
  }
}

async function FillUserData(id_cognito, email, username, db) {
  try {
    user_sub_cognito = undefined
    body = {}
    body.user_name = username
    body.user_email = email
    body.user_id_cognito = email
    body.user_sub_cognito = id_cognito
    body.user_ad = true
    body.user_role_id = '1'

    console.log('1. Check user exist in DB')
    const users = await db.query(
      `SELECT 
        u.user_sub_cognito, 
        u.user_role_id,
        GROUP_CONCAT(p.permission_name) AS permissions
        FROM users u
        LEFT JOIN roles_permissions rp on rp.roles_permissions_role_id = user_role_id
        LEFT JOIN permissions p on p.permission_id = rp.roles_permissions_permission_id 
        WHERE user_sub_cognito = ?
        GROUP BY u.user_sub_cognito`,
      [body.user_sub_cognito]
    )

    if (typeof users !== undefined && users.length > 0) {
      const user = users.shift()
      console.log('user', user)
      user_sub_cognito = user.user_sub_cognito
      body.user_role_id = user.user_role_id
      body.permissions = user.permissions
    }

    if (!user_sub_cognito) {
      console.log('2. User does not exist.')
      // ApiKey
      const user_api_key = await createApiKey()
      body.user_api_key = user_api_key.value

      makeSchemaValidation(body, requestBodySchemas.users.createUserSSO)
      // Attribute List
      console.log('3. Fill information about user in Cognito')
      await setAttrs(body.user_email, body.user_api_key, body.user_role_id)

      console.log('4. Create User in DB')
      await insertToDb(
        {
          user_role_id: body.user_role_id,
          user_name: body.user_name,
          user_email: body.user_email,
          user_id_cognito: body.user_email,
          user_sub_cognito: body.user_sub_cognito,
          user_api_key: body.user_api_key,
          user_ad: body.user_ad,
        },
        db
      )
    } else {
      console.log('User exist', body.user_email)
      return {
        user_role: body.user_role_id,
        user_permissions: body.permissions,
      }
    }
  } catch (error) {
    console.error('error ==>', error)
  }

  return { user_role: '1', user_permissions: 'ABM_APIS,ABM_LINEAS_DE_NEGOCIOS,ABM_ROLES,ABM_USUARIOS,ABM_VERSIONES' }
}

//Fill information in cognito (user_api_key and user active)
async function setAttrs(user_name, user_api_key, user_role_id) {
  let user_permissions_names = await getPermissionsForRole(user_role_id)

  await cognitoIdentityServiceProvider
    .adminUpdateUserAttributes({
      UserAttributes: [
        { Name: 'custom:api_key', Value: user_api_key },
        { Name: 'custom:user_active', Value: '1' },
        { Name: 'custom:user_permissions', Value: user_permissions_names },
        { Name: 'custom:role_id', Value: user_role_id },
      ],
      UserPoolId: poolData.UserPoolId,
      Username: user_name,
    })
    .promise()
}

// Insert information into db
async function insertToDb(userData, db) {
  return db.query(
    `INSERT INTO users (user_role_id, user_name, user_email, user_id_cognito, user_sub_cognito, user_api_key, user_ad) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      userData.user_role_id,
      userData.user_name,
      userData.user_email,
      userData.user_id_cognito,
      userData.user_sub_cognito,
      userData.user_api_key,
      userData.user_ad,
    ]
  )
}

module.exports = {
  handler,
}

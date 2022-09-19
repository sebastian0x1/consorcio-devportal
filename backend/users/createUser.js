require('dotenv').config()
const AWS = require('aws-sdk')
const { poolData, userPool, AmazonCognitoIdentity, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const dbConnection = require('../utils/dbConnection')
const { unHash } = require('../utils/hashing')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const { v4: uuid } = require('uuid')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Body
  let body = JSON.parse(event.body)
  body.user_name = unHash(body.user_name)
  body.user_email = unHash(body.user_email)
  body.user_password = unHash(body.user_password)

  console.log('Inserting new user => ', JSON.stringify(body))

  // Attribute List
  let attributeList = undefined

  const db = await dbConnection.connect()

  try {
    // Body validation
    makeSchemaValidation(body, requestBodySchemas.users.createUser)

    // ApiKey
    body.user_api_key = await createApiKey()
    body.user_api_key = body.user_api_key.value

    // Attribute List
    attributeList = await setAttrs(body, db)
  } catch (error) {
    console.error('error ==>', error)

    // Set response
    return Responses.error400(event.httpMethod, `Error al crear Usuario con Email: ${body.user_email}.`, event.headers)
  }

  // Sign Up
  return new Promise((resolve, reject) => {
    userPool.signUp(body.user_email, body.user_password, attributeList, null, async function (err, result) {
      if (err) {
        console.log('Signup.Error =>', err)
        return reject(err)
      }

      // Cognito ID
      let cognito_id = result.userSub

      await cognitoIdentityServiceProvider
        .adminUpdateUserAttributes({
          UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
          UserPoolId: poolData.UserPoolId,
          Username: cognito_id,
        })
        .promise()

      // Insert to DB
      await insertToDb(
        {
          user_role_id: body.user_role_id,
          user_name: body.user_name,
          user_email: body.user_email,
          user_id_cognito: cognito_id,
          user_api_key: body.user_api_key,
          user_sub_cognito: cognito_id,
        },
        db
      )

      resolve()
    })
  })
    .then(() => {
      // Set response
      return Responses.ok204(event.httpMethod, event.headers)
    })
    .catch((e) => {
      switch (e.code) {
        case 'InvalidPasswordException':
          return Responses.error400(
            event.httpMethod,
            `La contraseña debe tener: mayúsculas, minúsculas, números y caracteres. Intenta de nuevo.`,
            event.headers
          )
        case 'UsernameExistsException':
          return Responses.error409(
            event.httpMethod,
            `El email '${body.user_email}' ya está en uso. Pruebe con otro.`,
            event.headers
          )
        default:
          return Responses.error400(event.httpMethod, `Error al crear Usuario. Contáctese con el Administrador.`, event.headers)
      }
    })
}

async function setAttrs({ user_email, user_name, user_api_key, user_role_id }, db) {
  let user_permissions_names = await getPermissionsForRole(user_role_id, db)

  console.log('user_email', user_email, typeof user_email)
  console.log('user_name', user_name, typeof user_name)
  console.log('user_api_key', user_api_key, typeof user_api_key)
  console.log('user_role_id', user_role_id, typeof user_role_id)
  console.log('user_permissions_names', user_permissions_names, typeof user_permissions_names)

  // Attribute List
  let attributeList = []
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'email',
      Value: user_email,
    })
  )
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'name',
      Value: user_name,
    })
  )
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'custom:api_key',
      Value: user_api_key,
    })
  )
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'custom:role_id',
      Value: String(user_role_id),
    })
  )
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'custom:user_permissions',
      Value: user_permissions_names,
    })
  )
  attributeList.push(
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'custom:user_active',
      Value: '1',
    })
  )

  return attributeList
}

async function insertToDb(userData, db) {
  return db.query(
    `INSERT INTO users (user_role_id, user_name, user_email, user_id_cognito, user_api_key, user_sub_cognito) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      userData.user_role_id ? userData.user_role_id : null,
      userData.user_name,
      userData.user_email,
      userData.user_id_cognito,
      userData.user_api_key,
      userData.user_sub_cognito,
    ]
  )
}

async function getPermissionsForRole(role_id, db) {
  if (!db) db = await dbConnection.connect()
  let user_permissions_names = await db.query(
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

  user_permissions_names = user_permissions_names.shift()

  if (user_permissions_names && user_permissions_names.permission_names)
    user_permissions_names = user_permissions_names.permission_names

  return user_permissions_names || ''
}

async function createApiKey() {
  const apigateway = new AWS.APIGateway()
  const api_key_value = uuid()
  const params = {
    name: `consorcio_seguros_${api_key_value}`,
    value: api_key_value,
    enabled: true,
  }
  return new Promise((resolve, reject) => {
    apigateway.createApiKey(params, function (err, data) {
      if (err) {
        console.log(err, err.stack)
        reject(err)
      }

      console.log('createApiKey.data =>', data)
      resolve(data)
    })
  })
}

module.exports = {
  handler,
  createApiKey,
  getPermissionsForRole,
}

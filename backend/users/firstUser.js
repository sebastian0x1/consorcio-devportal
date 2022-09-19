require('dotenv').config()
const AWS = require('aws-sdk')
const { poolData, userPool, AmazonCognitoIdentity, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const { v4: uuid } = require('uuid')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  const res = await cognitoIdentityServiceProvider.listUsers({ UserPoolId: poolData.UserPoolId, Limit: 1, Filter: `email = "${process.env.INIT_USER_EMAIL}"` }).promise()
  if (res.Users.length > 0) return 'Success'
  // Body
  let body = {}
  body.user_name = process.env.INIT_USER_NAME
  body.user_email = process.env.INIT_USER_EMAIL
  body.user_password = process.env.INIT_USER_PASSWORD
  body.user_role_id = '0'

  console.log('Inserting new user => ', JSON.stringify(body))

  // Attribute List
  let attributeList = undefined

  try {
    // Body validation
    makeSchemaValidation(body, requestBodySchemas.users.createUser)
    console.log("33")

    // User permissions
    body.user_permissions_names = process.env.INIT_USER_PERMISSIONS

    // ApiKey
    body.user_api_key = await createApiKey()
    body.user_api_key = body.user_api_key.value

    // Attribute List
    attributeList = await setAttrs(body)
  } catch (error) {
    console.error('error ==>', error)

    // Set response
    return `Error al crear Usuario con Email: ${body.user_email}.`
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

      resolve()
    })
  })
    .then(() => {
      // Set response
      return 'First User finished'
    })
    .catch((e) => {
      console.log('error => ', e)
      return `Error al crear Usuario con Email: ${body.user_email}.`
    })
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

async function setAttrs({ user_email, user_name, user_api_key, user_role_id, user_permissions_names }) {
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

module.exports = {
  handler,
}

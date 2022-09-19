require('dotenv').config()
const { unHash } = require('../utils/hashing')
const { poolData, poolDataSSO, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Cognito ID
  let isADUser = false
  let cognito_id = event.pathParameters.cognito_id
  let userPoolID = undefined

  if (!cognito_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al actualizar las credenciales.`, event.headers)
  }

  try {
    let body = JSON.parse(event.body)
    body = JSON.parse(unHash(body.data))
    console.log('body before', body)

    if (body?.isADUser != undefined) {
      isADUser = body.isADUser
      delete body.isADUser
    }

    console.log('body after', body)
    // Body validation
    makeSchemaValidation(body, requestBodySchemas.users.saveSsoCredentials)

    // Attribute list
    let ssoAttributeList = await setAttrs(body)

    if (isADUser == true) {
      userPoolID = poolDataSSO.UserPoolId
    } else {
      userPoolID = poolData.UserPoolId
    }

    console.log('userPoolID', userPoolID)
    console.log('cognito_id', cognito_id)

    await cognitoIdentityServiceProvider
      .adminUpdateUserAttributes({
        UserAttributes: ssoAttributeList,
        UserPoolId: userPoolID,
        Username: cognito_id,
      })
      .promise()

    return Responses.ok204(event.httpMethod, event.headers)
  } catch (error) {
    console.error(error)

    // Set response
    return Responses.error400(event.httpMethod, `Error al actualizar User IdCognito: ${cognito_id}.`, event.headers)
  }
}

async function setAttrs({ ssoClientSecret, ssoClientID, ssoUsername, ssoPassword, realm, grantType }) {
  // Attribute List
  let attributeList = []
  attributeList.push({ Name: 'custom:ssoClientSecret', Value: ssoClientSecret })
  attributeList.push({ Name: 'custom:ssoClientID', Value: ssoClientID })
  attributeList.push({ Name: 'custom:ssoUsername', Value: ssoUsername })
  attributeList.push({ Name: 'custom:ssoPassword', Value: ssoPassword })
  attributeList.push({ Name: 'custom:realm', Value: realm })
  attributeList.push({ Name: 'custom:grantType', Value: grantType })

  return attributeList
}

module.exports = {
  handler,
}

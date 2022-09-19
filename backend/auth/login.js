const { userPool, AmazonCognitoIdentity } = require('../utils/awsConstants')
const { unHash } = require('../utils/hashing')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')
const jwt_decode = require('jwt-decode')

const handler = async (event, context, callback) => {
  try {
    // Create response object
    let response = {
      statusCode: undefined,
      body: undefined,
    }

    // Body
    let body = JSON.parse(event.body)
    console.log(body)

    // Body validation
    makeSchemaValidation(body, requestBodySchemas.auth.login)

    // Unhash
    let username = unHash(body.username)
    let password = unHash(body.password)

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: username,
      Password: password,
    })

    let userData = {
      Username: username,
      Pool: userPool,
    }
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

    let res = await new Promise(function (resolve, reject) {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => resolve(result),
        onFailure: (err) => reject(err),
      })
    }).catch((e) => {
      //console.error("ERROR =>", e)

      // Response
      response.statusCode = 404
      response.body = 'Usuario/Contraseña inválidos.'
    })

    if (response.statusCode) return Responses.error404(event.httpMethod, response.body, event.headers)

    // Check if user is active
    let idToken = res.getIdToken().getJwtToken()
    let jwtDecoded = jwt_decode(idToken)
    let user_active = Number(jwtDecoded['custom:user_active'])
    console.log("user_active", user_active, typeof user_active)

    if (!user_active) {
      response.statusCode = 409
      response.body = 'Usuario desactivado.'
      return Responses.error409(event.httpMethod, response.body, event.headers)
    }

    // Response
    response.statusCode = 201
    response.body = {
      access_token: res.getAccessToken().getJwtToken(),
      id_token: idToken,
      refresh_token: res.getRefreshToken().getToken(),
    }
    console.log('login response.body', response.body)

    return Responses.ok201(event.httpMethod, response.body, event.headers)
  } catch (e) {
    console.error("error", e)
    return Responses.error400(event.httpMethod, "Error al loguearse", event.headers)
  }
}

module.exports = {
  handler,
}

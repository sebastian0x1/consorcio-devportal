const { userPool, userPoolSSO, AmazonCognitoIdentity, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')
const jwt_decode = require('jwt-decode')

async function handler(event) {
  let status200 = undefined
  let status403 = undefined
  let userData = undefined

  try {
    console.log('*********************Refreshing tokens...********************')
    let body = JSON.parse(event.body)
    // console.log('body1', body)

    // Body validation
    makeSchemaValidation(body, requestBodySchemas.auth.refreshTokens)
    console.log('body despues de makeSchemaValidation', body)
    if (body?.isADUser == undefined) {
      // console.log('entro al body cuando el isaduser no esta seteado')
      body.isADUser = false
    }
    if (body.isADUser == false) {
      // console.log('USERPOOL SIN SSO')
      userData = {
        Username: body.username,
        Pool: userPool,
      }
    } else {
      // console.log('USERPOOL CON SSO')
      userData = {
        Username: body.username,
        Pool: userPoolSSO,
      }
    }

    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
      RefreshToken: body.refresh_token_previous_login,
    })
    // console.log('RefreshToken', RefreshToken)

    // console.log(
    //   'COMPARACION TOKENS: refresh_token_previous_login =>',
    //   body.refresh_token_previous_login,
    //   'RefreshToken =>',
    //   RefreshToken.getToken()
    // )

    let res = await new Promise(function (resolve, reject) {
      cognitoIdentityServiceProvider.initiateAuth(
        {
          ClientId: body.isADUser == false ? userPool.getClientId() : userPoolSSO.getClientId(),
          AuthFlow: 'REFRESH_TOKEN',
          AuthParameters:
            body.isADUser == false
              ? {
                  REFRESH_TOKEN: RefreshToken.getToken(),
                }
              : {
                  REFRESH_TOKEN: RefreshToken.getToken(),
                  SECRET_HASH: process.env.SECRETID_SSO,
                },
        },
        (err, session) => {
          console.log('session', session)
          if (err) {
            console.error(err)
            reject(err)
          } else {
            let retObj = {
              access_token: session.AuthenticationResult.AccessToken,
              id_token: session.AuthenticationResult.IdToken,
              refresh_token: RefreshToken.getToken(),
            }
            console.log('retObj', retObj)
            resolve(retObj)
          }
        }
      )
    })

    // res = JSON.parse(res)

    let user = await getUser(res)

    await recodeToken(res, user)
      .then((recoded) => {
        // console.log('recoded', recoded)
        // console.log('event.httpMethod', event.httpMethod)
        // console.log('response', response)
        // console.log('event.headers', event.headers)
        //console.log('Responses.ok200(event.httpMethod, response, event.headers)', Responses.ok200(event.httpMethod, response, event.headers))
        // console.log('res post recode', res)
        res.id_token = recoded
        status200 = Responses.ok200(event.httpMethod, res, event.headers)
      })
      .catch((error) => {
        console.log('función enRechazo invocada: ', error)
        status403 = Responses.error403(event.httpMethod, 'Problema con refresh token!', event.headers)
      })
    if (status200 !== undefined) {
      return status200
    }
    if (status403 !== undefined) {
      return status403
    }

    return Responses.error400(event.httpMethod, 'OH OH Algo paso!', event.headers)
  } catch (e) {
    console.error('-------------error tokens--------', e)
    return Responses.error400(event.httpMethod, 'Error al actualizar tokens!', event.headers)
  }
}

const getUser = async (rta) => {
  // decode token to easily get cognito username
  const jwtDecoded = jwt_decode(rta.id_token)

  let userData = {
    Username: jwtDecoded['cognito:username'],
    UserPoolId: userPoolSSO.getUserPoolId(),
  }

  let user = await new Promise(function (resolve, reject) {
    cognitoIdentityServiceProvider.adminGetUser(userData, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })

  let ssoUsername = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:ssoUsername'
  })

  let ssoClientID = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:ssoClientID'
  })

  let ssoClientSecret = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:ssoClientSecret'
  })

  let ssoPassword = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:ssoPassword'
  })

  let realm = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:realm'
  })

  let grantType = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:grantType'
  })

  let userActive = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:user_active'
  })

  let idRole = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:role_id'
  })

  let userPermissions = user.UserAttributes.find((attribute) => {
    return attribute.Name === 'custom:user_permissions'
  })

  return {
    ssoUsername: ssoUsername?.Value,
    ssoClientID: ssoClientID?.Value,
    ssoClientSecret: ssoClientSecret?.Value,
    ssoPassword: ssoPassword?.Value,
    realm: realm?.Value,
    grantType: grantType?.Value,
    userActive: userActive && Number(userActive.Value) === 1,
  }
}

const recodeToken = async (rta, user) => {
  // split token into 3 string objects, string at position 1 is payload
  let encodedtokenArr = rta.id_token.split('.')

  // decode payload to JSON object
  let decodedTokenPayload = JSON.parse(Buffer.from(encodedtokenArr[1], 'base64').toString('ascii'))

  // set attributes to payload JSON object
  decodedTokenPayload['custom:ssoUsername'] = user.ssoUsername
  decodedTokenPayload['custom:ssoClientID'] = user.ssoClientID
  decodedTokenPayload['custom:ssoClientSecret'] = user.ssoClientSecret
  decodedTokenPayload['custom:ssoPassword'] = user.ssoPassword
  decodedTokenPayload['custom:realm'] = user.realm
  decodedTokenPayload['custom:grantType'] = user.grantType
  decodedTokenPayload['custom:user_active'] = user.userActive

  // encode payload JSON object to base64 string
  encodedtokenArr[1] = Buffer.from(JSON.stringify(decodedTokenPayload)).toString('base64')

  // join the 3 token parts into one string
  return encodedtokenArr.join('.')
}

module.exports = {
  handler,
}

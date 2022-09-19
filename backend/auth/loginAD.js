const { userPoolSSO, AmazonCognitoIdentity, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const jwt_decode = require('jwt-decode')
const req = require('request')
const { promisify } = require('util')
const request = promisify(req.post)
const { unHash } = require('../utils/hashing')
const Responses = require('../utils/response')

const CLIENTID = process.env.CLIENTID_SSO
const SECRETID = process.env.SECRETID_SSO
const ALLOWED_ORIGINS_URL = process.env.ALLOWED_ORIGINS_URL
const REGION = process.env.REGION
const AWS_DOMAIN = process.env.AWS_DOMAIN

const handler = async (event, context, callback) => {
  console.log('event: ', event)
  try {
    // Create response object
    let response = {
      statusCode: undefined,
      body: undefined,
    }

    let url = 'https://' + AWS_DOMAIN + '.auth.' + REGION + '.amazoncognito.com/oauth2/token'
    let basic = 'Basic ' + Buffer.from(CLIENTID + ':' + SECRETID).toString('base64')

    let { code } = JSON.parse(event.body)
    //console.log('code', code)
    //code = unHash(code)
    console.log('code', code)

    let options = {
      method: 'POST',
      url: url,
      headers: {
        Authorization: basic,
        'Content-Type': 'application/x-www-form-urlencoded',
        // Cookie: 'XSRF-TOKEN=187d4873-c4d7-4491-bf5a-aa5cbfbc4ccc',
      },
      form: {
        grant_type: 'authorization_code',
        client_id: CLIENTID,
        code: code,
        redirect_uri: ALLOWED_ORIGINS_URL.split(',')[1] + '/loginAD',
      },
    }

    console.log('options', options)

    //request
    let rta = await request(options)
    rta = JSON.parse(rta.body)
    console.log('rta', rta)

    //get User cognitoIdentityServiceProvider
    let user = await getUser(rta)

    if (user.userActive === false) {
      response.statusCode = 409
      response.body = 'Usuario desactivado.'
      return Responses.error409(event.httpMethod, response.body, event.headers)
    }

    // insert missing custom attributes that are not present on token request
    rta.id_token = await recodeToken(rta, user)

    if (rta.error) {
      response.statusCode = 404
      response.body = 'Datos inválidos.' + rta.error
    }

    if (response.statusCode) return Responses.error404(event.httpMethod, response.body, event.headers)

    // Response
    response.statusCode = 201
    response.body = {
      access_token: rta.access_token,
      id_token: rta.id_token,
      refresh_token: rta.refresh_token,
    }

    return Responses.ok201(event.httpMethod, response, event.headers)
  } catch (e) {
    console.error('error', e)
    return Responses.error400(event.httpMethod, 'Error al loguearse', event.headers)
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

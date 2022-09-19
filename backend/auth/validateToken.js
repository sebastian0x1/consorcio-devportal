const request = require('request')
const jwkToPem = require('jwk-to-pem')
const jwt = require('jsonwebtoken')
const { poolRegion, poolData } = require('../utils/awsConstants')

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {}
  authResponse.principalId = principalId
  if (effect && resource) {
    const policyDocument = {}
    policyDocument.Version = '2012-10-17'
    policyDocument.Statement = []
    const statementOne = {}
    statementOne.Action = 'execute-api:Invoke'
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }
  return authResponse
}

function handler(event, context, callback) {
  console.log("ValidateToken")
  console.log('event', event)
  console.log('event.authorizationToken', event.authorizationToken)

  if (!event.authorizationToken) {
    return callback('Unauthorized')
  }

  const tokenParts = event.authorizationToken.split(' ')
  const tokenValue = tokenParts[1]

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized')
  }

  request(
    {
      url: `https://cognito-idp.${poolRegion}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true,
    },
    function (error, response, body) {
      console.log("error", error)
      console.log("response", response)
      if (!error && response.statusCode === 200) {
        let pems = {}
        let keys = body['keys']
        for (let i = 0; i < keys.length; i++) {
          //Convert each key to PEM
          let key_id = keys[i].kid
          let modulus = keys[i].n
          let exponent = keys[i].e
          let key_type = keys[i].kty
          let jwk = { kty: key_type, n: modulus, e: exponent }
          pems[key_id] = jwkToPem(jwk)
        }

        //validate the token
        let decodedJwt = jwt.decode(tokenValue, { complete: true })
        if (!decodedJwt) {
          console.log('Not a valid JWT token')
          return callback('Unauthorized')
        }

        let kid = decodedJwt.header.kid
        let pem = pems[kid]
        if (!pem) {
          console.log('Invalid token')
          return callback('Unauthorized')
        }

        jwt.verify(tokenValue, pem, function (err, payload) {
          if (err) {
            console.log('Invalid Token.')
            return callback('Unauthorized')
          } else {
            console.log('Valid Token.')
            console.log(payload)
            return callback(null, generatePolicy(payload.username, 'Allow', event.methodArn))
          }
        })
      } else {
        console.log('Error! Unable to download JWKs')
        return callback('Error! Unable to download JWKs')
      }
    }
  )
}

module.exports = {
  handler,
}

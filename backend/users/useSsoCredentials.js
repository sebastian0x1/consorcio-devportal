require('dotenv').config()
const { unHash } = require('../utils/hashing')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')
const axios = require('axios').default
const qs = require('qs')
const { getRealm } = require('./getRealms')

async function handler(event, context, callback) {
  try {
    let body = JSON.parse(event.body)
    body = JSON.parse(unHash(body.data))
    console.log('body', body)

    // Body validation
    try {
      makeSchemaValidation(body, requestBodySchemas.users.useSsoCredentials)
    } catch (e) {
      console.log('Error de credenciales', e)
      return Responses.error428(event.httpMethod, 'Error de credenciales.', event.headers)
    }

    //Get reino URL
    let realmParts = body.realm.split('-')

    let realmURL = await getRealm({
      realm_name: realmParts[0] || '',
      stage_name: realmParts[1] || '',
    })
    console.log('realmURL: ', realmURL)

    const options = {
      method: 'POST',
      url: realmURL,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: body.grantType,
        client_secret: body.ssoClientSecret,
        client_id: body.ssoClientID,
        username: body.ssoUsername,
        password: body.ssoPassword,
      }),
    }
    console.log('options', options)

    const response = await axios(options)
    console.log('response.status', response.status)

    if (response.status < 300) {
      return Responses.ok200(
        event.httpMethod,
        { token_type: response.data.token_type, access_token: response.data.access_token },
        event.headers
      )
    } else {
      return Responses.error400(event.httpMethod, `Error en la request.`, event.headers)
    }
  } catch (error) {
    console.log('error', error)
    return Responses.error400(event.httpMethod, `Error en el parse de datos.`, event.headers)
  }
}

module.exports = {
  handler,
}

const axios = require('axios').default
const Responses = require('../utils/response')
const ALLOWED_ORIGINS_URL = process.env.ALLOWED_ORIGINS_URL

exports.handler = async (event, context, callbacks) => {

    let body = JSON.parse(event.body)

    const options = {
        method: body.method,
        url: body.url,
        headers: body.headers,
        data: body.body,
    }

    let result = await axios(options)
    let response = Responses.setResponseByStatus(result.status, body.method, result.data, body.headers)

    response.headers['Content-Type'] = result.headers['content-type']
    console.log('response => ', response)

    return response

}
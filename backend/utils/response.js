const ALLOWED_ORIGINS_URL = process.env.ALLOWED_ORIGINS_URL

const CUSTOM_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  // 'Access-Control-Allow-Origin': ALLOWED_ORIGINS_URL,
  'Content-Type': 'application/json',
}

class Responses {
  static setResponseByStatus(status, method, body, headers = {}) {
    switch (status) {
      case 200:
        return Responses.ok200(method, body, headers)
      case 201:
        return Responses.ok201(method, body, headers)
      case 204:
        return Responses.ok204(method, headers)
      case 400:
        return Responses.error400(method, body, headers)
      case 403:
        return Responses.error403(method, body, headers)
      case 404:
        return Responses.error404(method, body, headers)
      case 409:
        return Responses.error409(method, body, headers)
      case 427:
        return Responses.error427(method, body, headers)
      case 428:
        return Responses.error428(method, body, headers)
      default:
        return Responses.UnknownStatus(status, method, body, headers)
    }
  }

  static UnknownStatus(status, method, body, headers = {}) {
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: status,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static getAuthorizerCors = (headers) => {
    if (ALLOWED_ORIGINS_URL === undefined) {
      headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1'
    } else {
      const allowedOrigins = ALLOWED_ORIGINS_URL.split(',').map((item) => item.trim())
      console.log('allowedOrigins', allowedOrigins)
      const origin = headers.Origin || headers.origin
      console.log('origin', origin)
      let allowed = allowedOrigins[1]

      if (origin) {
        allowedOrigins.forEach((allowedOrigin) => {
          if (origin.match(allowedOrigin)) {
            allowed = allowedOrigin
          }
        })
      }
      headers['Access-Control-Allow-Origin'] = allowed
    }
    console.log('headers', headers)
    return headers
  }

  static ok200(method, body, headers = {}) {
    console.log('statusCode: ', 200)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static ok201(method, body, headers = {}) {
    console.log('statusCode: ', 201)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 201,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static ok204(method, headers = {}) {
    console.log('statusCode: ', 204)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 204,
      body: JSON.stringify([]),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static error400(method, body, headers = {}) {
    console.log('statusCode: ', 400)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 400,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static error403(method, body, headers = {}) {
    console.log('statusCode: ', 403)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 403,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static error404(method, body, headers = {}) {
    console.log('statusCode: ', 404)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 404,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static error409(method, body, headers = {}) {
    console.log('statusCode: ', 409)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 409,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static error427(method, body, headers = {}) {
    console.log('statusCode: ', 427)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 427,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }

  static error428(method, body, headers = {}) {
    console.log('statusCode: ', 428)
    headers = this.getAuthorizerCors(headers)
    return {
      statusCode: 428,
      body: JSON.stringify(body),
      headers: {
        ...CUSTOM_HEADERS,
        'Access-Control-Allow-Methods': 'OPTIONS,' + method,
        ...headers,
      },
    }
  }
}

module.exports = Responses

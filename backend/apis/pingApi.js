const Responses = require('../utils/response')

exports.handler = async (event, context, callbacks) => {
  console.log('event', event)

  return Responses.ok200('get', '')
}

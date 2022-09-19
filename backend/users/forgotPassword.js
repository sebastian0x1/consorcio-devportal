require('dotenv').config()
const { unHash } = require('../utils/hashing')
const { userPool, AmazonCognitoIdentity } = require('../utils/awsConstants')
const Responses = require('../utils/response')

const handler = async (event) => {
  console.log('event.body', event.body)
  const { username } = JSON.parse(event.body)

  let userData = {
    Username: unHash(username),
    Pool: userPool,
  }

  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
  return new Promise(async (resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: function (data) {
        // successfully initiated reset password request
        console.log('CodeDeliveryData from forgotPassword: ' + JSON.stringify(data))
        resolve()
      },
      onFailure: function (err) {
        console.error(err)
        reject()
      },
    })
  })
    .then(() => {
      // Set response
      return Responses.ok204(event.httpMethod, event.headers)
    })
    .catch((e) => {
      console.error('ERROR', e)
      return Responses.error400(
        event.httpMethod,
        `Error al intentar iniciar el proceso de restauración de contraseña.`,
        event.headers
      )
    })
}

module.exports = {
  handler,
}

require('dotenv').config()
const { unHash } = require('../utils/hashing')
const { userPool, AmazonCognitoIdentity, cognitoIdentityServiceProvider } = require('../utils/awsConstants')
const Responses = require('../utils/response')

const handler = async (event) => {
  let { user_email, password, verificationCode } = JSON.parse(event.body)

  password = unHash(password)

  let userData = {
    Username: user_email,
    Pool: userPool,
  }

  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess() {
        resolve()
      },
      onFailure(err) {
        console.error(err)
        reject(err)
      },
    })
  })
    .then(() => {
      console.log('Password confirmed!')
      return Responses.ok204(event.httpMethod, event.headers)
    })
    .catch((e) => {
      console.error('ERROR', e)
      return Responses.error400(
        event.httpMethod,
        e?.code || `Error al intentar iniciar el proceso de restauración de contraseña.`,
        event.headers
      )
    })
}

module.exports = {
  handler,
}

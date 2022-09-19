require('dotenv').config()
const { userPool, AmazonCognitoIdentity } = require('../utils/awsConstants')
const { unHash } = require('../utils/hashing')
const Responses = require('../utils/response')

function handler(event) {
  let { username, password, newPassword } = JSON.parse(event.body)

  username = unHash(username)
  password = unHash(password)
  newPassword = unHash(newPassword)

  let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  })

  let userData = {
    Username: username,
    Pool: userPool,
  }
  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        cognitoUser.changePassword(password, newPassword, (err, result) => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            console.log('Successfully changed password of the user.')
            console.log(result)
            resolve('Successfully changed password of the user.')
          }
        })
      },
      onFailure: function (err) {
        console.log(err)
        reject(err)
      },
    })
  })
    .then(() => Responses.ok204(event.httpMethod, event.headers))
    .catch((e) => {
      const map = {
        InvalidPasswordException: `La contraseña debe tener: mayúsculas, minúsculas, números y caracteres. Intenta de nuevo.`,
      }
      return Responses.error400(
        event.httpMethod,
        map[e.code] | `Error al cambiar la contraseña. Contáctese con el Administrador.`,
        event.headers
      )
    })
}

module.exports = {
  handler,
}

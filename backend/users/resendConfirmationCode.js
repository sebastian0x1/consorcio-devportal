require('dotenv').config()
const { userPool, AmazonCognitoIdentity, cognitoIdentityServiceProvider } = require('../utils/awsConstants')

const handler = async (event) => {
  const { username } = event.pathParameters

  let userData = {
    Username: username,
    Pool: userPool,
  }

  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        reject(err)
      }
      console.log('call result: ' + JSON.stringify(result))
      resolve(result)
    })
  })
}

module.exports = {
  handler,
}

let { userPool, AmazonCognitoIdentity } = require('../utils/awsConstants')

const handler = (event) => {
  const { username } = event.pathParameters
  const { confirmation_code } = JSON.parse(event.body)

  const userData = {
    Username: username,
    Pool: userPool,
  }

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
  console.log('cognitoUser', cognitoUser)

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(confirmation_code, true, function (err, result) {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = {
  handler,
}

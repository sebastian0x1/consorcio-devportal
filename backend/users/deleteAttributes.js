let { userPool, AmazonCognitoIdentity } = require('../utils/awsConstants')

function DeleteAttributes(username, password, attributeList) {
  let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  })

  let userData = {
    Username: username,
    Pool: userPool,
  }

  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      cognitoUser.deleteAttributes(attributeList, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          console.log(result)
        }
      })
    },
    onFailure: function (err) {
      console.log(err)
    },
  })
}

module.exports = {
  DeleteAttributes,
}

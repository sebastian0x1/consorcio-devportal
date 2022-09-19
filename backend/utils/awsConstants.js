const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
const { CognitoIdentityServiceProvider } = require('aws-sdk')
//global.fetch = require('node-fetch');

const poolData = {
  UserPoolId: process.env.USERPOOLID, // Your user pool id here
  ClientId: process.env.CLIENTID, // Your client id here
}

const poolDataSSO = {
  UserPoolId: process.env.USERPOOLID,
  ClientId: process.env.CLIENTID_SSO,
  SecretId: process.env.SECRETID_SSO,
  DefaultRedirectURI: process.env.ALLOWED_ORIGINS_URL + '/loginAD',
}

const poolRegion = process.env.REGION

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)
const userPoolSSO = new AmazonCognitoIdentity.CognitoUserPool(poolDataSSO)

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({ region: poolRegion })

module.exports = Object.freeze({
  poolRegion,
  userPool,
  userPoolSSO,
  poolDataSSO,
  poolData,
  AmazonCognitoIdentity,
  cognitoIdentityServiceProvider,
})

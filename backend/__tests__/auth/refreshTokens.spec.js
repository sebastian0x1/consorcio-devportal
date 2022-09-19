require('dotenv').config()
const handler = require('../../auth/refreshTokens.js')
const { userPool, AmazonCognitoIdentity } = require('../utils/awsConstants')

describe('refresh token test', () => {
  let event
  const userData = {
    Username: 'username',
    Pool: 'userPool',
  }
  const userCognito = {
    UserPoolId: 'dsa',
    userPoolWebClientId: 'dsadasd',
  }
  event = { ...userData }

  afterAll()
  beforeAll()
  test('200 ok', () => {
    const evento = handler(eventi)
    expect(evento.statusCode).toBe(200)
  })
})

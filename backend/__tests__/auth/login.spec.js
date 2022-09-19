require('dotenv').config()
const { handler } = require('../../auth/login.js')
const { makeHash } = require('../../utils/hashing')
const { CognitoUser } = require('amazon-cognito-identity-js')

describe('Login', () => {
  jest.setTimeout(10000)
  let event = {
    body: JSON.stringify({
      username: makeHash('demi'),
      password: makeHash('vselko'),
    }),
  }
  test('Login 201 ok', async () => {
    const result = await handler(event)
    expect(result.statusCode).toBe(201)
  })
  test('Login 201 MoOk ', async () => {
    const spyCognito = jest.mock()
    const spyCognitoUser = jest.spyOn(CognitoUser.prototype, 'getUserData').mockImplementation(() => {
      return Promise.resolve()
    })
    const result = await handler(event)
    // expect(spyCognito).toBeCalledTimes(1)
    expect(spyCognitoUser).toBeCalledTimes(1)
    expect(result.statusCode).toBe(201)
    // spyCognito.mockClear()
    spyCognitoUser.mockClear()
  })
})

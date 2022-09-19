const { handler } = require('../../users/AbmUsersTable')
const db = require('../../utils/dbConnection')
const Responses = require('../../utils/response')

describe('AbmUsersTable', () => {
  const data = {
    user_id: 'x',
    user_role_id: 'x',
    role_name: 'x',
    role_color: 'x',
    user_name: 'x',
    user_email: 'x',
    user_id_cognito: 'x',
    user_api_key: 'x',
    user_active: 'x',
    user_created_at: 'x',
    user_updated_a: 'x',
  }
  let context = { callbackWaitsForEmptyEventLoop: false }
  let event = { httpMethod: 'GET' }
  beforeAll(() => {})
  afterAll(() => {})
  test('Handler 200', async () => {
    const res = await handler(event, context)
    expect(res).toBe(data)
  })
})

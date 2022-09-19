const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')
const { cognitoIdentityServiceProvider, poolData } = require('../utils/awsConstants')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Role ID
  let role_id = event.pathParameters.role_id

  if (!role_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al actualizar Role ID: ${role_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    // Body
    let body = JSON.parse(event.body)
    console.log('Updating existing role => ', JSON.stringify(body))

    // Body validation
    makeSchemaValidation(body, requestBodySchemas.roles)

    let user_permissions_names

    // Update data
    await db
      .transaction()
      .query('UPDATE roles SET role_name=?, role_description=?, role_color=? WHERE role_id=?;', [
        body.role_name,
        body.role_description,
        body.role_color,
        role_id,
      ])
      // Business Lines
      .query('DELETE FROM roles_business_lines WHERE roles_business_lines_role_id=?;', [role_id])
      .query('INSERT INTO roles_business_lines (roles_business_lines_business_line_id, roles_business_lines_role_id) VALUES ?;', [
        body.role_business_lines.map((id) => {
          return [id, role_id]
        }),
      ])
      // Permissions
      .query('DELETE FROM roles_permissions WHERE roles_permissions_role_id=?;', [role_id])
      .query(() => {
        if (!body.role_permissions.length) return null
        return [
          'INSERT INTO roles_permissions (roles_permissions_permission_id, roles_permissions_role_id) VALUES ?;',
          [
            body.role_permissions.map((id) => {
              return [id, role_id]
            }),
          ],
        ]
      })
      .query(
        `
        SELECT
          GROUP_CONCAT(permissions.permission_name)
        FROM permissions
        LEFT JOIN roles_permissions ON roles_permissions.roles_permissions_permission_id=permissions.permission_id
        WHERE roles_permissions.roles_permissions_role_id=?;`,
        [role_id]
      )
      .query((result) => {
        console.log('SELECT GROUP_CONCAT(p.permission_name)... => ', result)
        const stringResult = Object.values(result.shift()).shift()
        user_permissions_names = stringResult !== null ? stringResult : ''
        return null
      })
      .rollback((e) => {
        console.error('Rollback.Error => ', e)
      })
      .commit()
    db.quit()

    // Update cognito
    await updateCognito(role_id, user_permissions_names)

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, `Error al actualizar Role ID: ${role_id}.`, event.headers)
  }
}

const updateCognito = async (role_id, user_permissions_names) => {
  const params = {
    UserPoolId: poolData.UserPoolId,
  }

  let users = await cognitoIdentityServiceProvider.listUsers(params).promise()

  const filteredUsers = users.Users.filter((user) =>
    user.Attributes.some((attr) => attr.Name === 'custom:role_id' && attr.Value === role_id)
  )
  console.log('filteredUsers => ', filteredUsers)

  let updateUsersPromises = []
  for (let user of filteredUsers) {
    updateUsersPromises.push(
      await cognitoIdentityServiceProvider
        .adminUpdateUserAttributes({
          UserAttributes: [{ Name: 'custom:user_permissions', Value: user_permissions_names }],
          UserPoolId: poolData.UserPoolId,
          Username: user.Username,
        })
        .promise()
    )
  }

  await Promise.all(updateUsersPromises)
}

module.exports = {
  handler,
}

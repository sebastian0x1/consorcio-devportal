const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Body
  let body = JSON.parse(event.body)
  console.log('Inserting new role => ', JSON.stringify(body))

  const db = await dbConnection.connect()

  try {
    // Body validation
    makeSchemaValidation(body, requestBodySchemas.roles)

    // Insert data
    let role_id
    await db
      .transaction()
      .query('INSERT INTO roles SET role_name=?, role_description=?, role_color=?;', [
        body.role_name,
        body.role_description,
        body.role_color,
      ])
      .query((r) => {
        role_id = r.insertId

        return [
          `INSERT INTO roles_business_lines (roles_business_lines_business_line_id, roles_business_lines_role_id) VALUES ?`,
          [
            body.role_business_lines.map((id) => {
              return [id, role_id]
            }),
          ],
        ]
      })
      .query(() => {
        if (!body.role_permissions.length) return null
        return [
          'INSERT INTO roles_permissions (roles_permissions_permission_id, roles_permissions_role_id) VALUES ?',
          [
            body.role_permissions.map((id) => {
              return [id, role_id]
            }),
          ],
        ]
      })
      .rollback((e) => {
        console.error('Rollback.Error => ', e)
      })
      .commit()

    db.quit()

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error(e)

    // Set response
    return Responses.error400(
      event.httpMethod,
      e?.errno === 1062 ? `El Rol '${body.role_name}' ya existe!.` : 'Error al crear el Rol.',
      event.headers
    )
  }
}

module.exports = {
  handler,
}

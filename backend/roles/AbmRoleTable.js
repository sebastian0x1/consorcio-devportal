const Responses = require('../utils/response')
const dbConnection = require('../utils/dbConnection')

function prepareResponse(data) {
  let test = Object.create(null)
  data.map((role) => {
    // Business Lines
    let role_business_lines = test[role.role_id]?.role_business_lines || []
    let exists = role_business_lines.findIndex((x) => x.business_line_id == role.business_line_id)

    // Add if not exists
    if (exists === -1) {
      if (role.business_line_id) {
        role_business_lines.push({
          business_line_id: role.business_line_id,
          business_line_name: role.business_line_name,
          business_line_color: role.business_line_color,
        })
      }
    }

    // Permissions
    let role_permissions = test[role.role_id]?.role_permissions || []
    exists = role_permissions.findIndex((x) => x.permission_id == role.permission_id)

    // Add if not exists
    if (exists === -1) {
      if (role.permission_id) {
        role_permissions.push({
          permission_id: role.permission_id,
          permission_name: role.permission_name,
          permission_color: role.permission_color,
        })
      }
    }

    test[role.role_id] = {
      role_id: role.role_id,
      role_name: role.role_name,
      role_description: role.role_description,
      role_color: role.role_color,
      role_created_at: role.role_created_at,
      role_updated_at: role.role_updated_at,
      role_business_lines: role_business_lines,
      role_permissions: role_permissions,
    }

    return role
  })

  return Object.values(test)
}

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  const db = await dbConnection.connect()

  console.log('Retrieving all roles...')

  try {
    let roleList = await db.query(
      `
      SELECT
        role_id,
        role_name,
        role_description,
        role_color,
        business_line_id,
        business_line_name,
        business_line_color,
        permission_id,
        permission_name,
        permission_color,
        role_created_at,
        role_updated_at
      FROM roles
      LEFT JOIN roles_business_lines ON roles_business_lines_role_id=role_id
      LEFT JOIN business_lines ON roles_business_lines_business_line_id=business_line_id
      LEFT JOIN roles_permissions ON roles_permissions_role_id=role_id
      LEFT JOIN permissions ON roles_permissions_permission_id=permission_id;
      `
    )

    roleList = prepareResponse(roleList)
    console.log('roleList', JSON.stringify(roleList, null, 2))

    // Set response
    return Responses.ok200(event.httpMethod, roleList, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, 'Error al cargar los datos.', event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

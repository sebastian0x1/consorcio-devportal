const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

function prepareResponse(data) {
  let test = Object.create(null)
  data.map((r) => {
    // Apis
    let apis_data = {
      api_id: r.api_id,
      api_apiid: r.api_apiid,
      api_name: r.api_name,
      api_color: r.api_color,
      api_is_external: r.api_is_external,
      api_created_at: r.api_created_at,
      api_tag_account: r.tag_account,
      api_tag_account_id: r.tag_account_id,
      api_tag_account_name: r.tag_account_name,
      api_tag_account_color: r.tag_account_color,
      api_tag_name: r.tag_name,
    }

    let stage_apis = test[r.business_line_id]?.stage_apis || []
    stage_apis.push({ ...apis_data })

    // Stages
    let stages_data = {
      stage_name: r.stage_name,
      stage_color: r.stage_color,
      stage_apis: stage_apis,
    }

    let business_line_stages = test[r.business_line_id]?.business_line_stages || []
    business_line_stages.push({ ...stages_data })

    // Business Lines
    test[r.business_line_id] = {
      business_line_name: r.business_line_name,
      business_line_stages: business_line_stages,
    }

    return r
  })

  return { business_lines: Object.values(test) }
}

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Role ID
  let role_id = event.pathParameters.role_id
  console.log(`Retrieving all apis for menu with RoleID '${role_id}'...`)

  const db = await dbConnection.connect()
  try {
    let apiList = await db.query(
      `
        SELECT
          business_line_id,
          business_line_name,
          stage_id,
          stage_name,
          stage_color,
          tag_account,
          tag_account_id,
          tag_account_name,
          tag_account_color,
          tag_name,
          api_id,
          api_apiid,
          api_name,
          api_color,
          api_is_external,
          api_created_at          
        FROM roles
        JOIN roles_business_lines ON roles_business_lines_role_id=role_id
        JOIN business_lines ON roles_business_lines_business_line_id=business_line_id
        JOIN business_lines_apis ON business_lines_apis_business_line_id=business_line_id
        JOIN apis ON business_lines_apis_api_id=api_id
        JOIN apis_stages ON apis_stages_api_id=api_id
        JOIN stages ON stage_id=apis_stages_stage_id
        LEFT JOIN apis_tag_accounts ON apis_tag_accounts_api_id=api_id
        LEFT JOIN tag_accounts ON tag_account_id=apis_tag_accounts_tag_account_id
        LEFT JOIN tags ON tag_id = tag_account_name
        WHERE role_id=? AND stage_active=1;
        `,
      [role_id]
    )

    apiList = prepareResponse(apiList)
    console.log('apiList', JSON.stringify(apiList, null, 2))

    // Set response
    return Responses.ok200(event.httpMethod, apiList, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, 'Error al cargar las APIs.', event.headers)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

const dbConnection = require('../utils/dbConnection')
const Responses = require('../utils/response')

function prepareResponse(data) {
  let test = Object.create(null)
  data.map((bs) => {
    // Apis
    let apisValue = test[bs.business_line_id]?.business_line_apis || []
    let exists = apisValue.findIndex((x) => x.api_id == bs.api_id)

    if (exists === -1) {
      if (bs.api_id) {
        apisValue.push({
          api_id: bs.api_id,
          api_name: bs.api_name,
          api_color: bs.api_color,
          api_stage: bs.api_stage,
        })
      }
    }

    // Tag Accounts
    let tagValue = test[bs.business_line_id]?.business_line_tag_accounts || []
    exists = tagValue.findIndex((x) => x.tag_account_id == bs.tag_account_id)

    if (exists === -1) {
      if (bs.tag_account_id) {
        tagValue.push({
          tag_account_id: bs.tag_account_id,
          tag_account_name: bs.tag_account_name,
          tag_account: bs.tag_account,
          tag_account_color: bs.tag_account_color,
        })
      }
    }

    // Response
    test[bs.business_line_id] = {
      business_line_id: bs.business_line_id,
      business_line_name: bs.business_line_name,
      business_line_color: bs.business_line_color,
      business_line_created_at: bs.business_line_created_at,
      business_line_updated_at: bs.business_line_created_at,
      business_line_apis: apisValue,
      business_line_tag_accounts: tagValue,
    }

    return bs
  })

  return Object.values(test)
}

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Retrieving all business lines...')
  const db = await dbConnection.connect()
  try {
    let bsList = await db.query(
      `
      SELECT
        business_line_id,
        business_line_name,
        business_line_color,
        tag_account_id,
        tag_name AS tag_account_name,
        tag_account,
        tag_account_color,
        api_id,
        api_name,
        stage_name AS api_stage,
        api_color,
        business_line_created_at,
        business_line_updated_at
      FROM business_lines
      LEFT JOIN business_lines_apis ON business_lines_apis_business_line_id=business_line_id
      LEFT JOIN apis ON business_lines_apis_api_id=api_id
      LEFT JOIN apis_stages ON apis_stages_api_id=api_id
      LEFT JOIN stages ON apis_stages_stage_id=stage_id
      LEFT JOIN business_lines_tag_accounts ON business_lines_tag_accounts_business_line_id=business_line_id
      LEFT JOIN tag_accounts ON tag_account_id=business_lines_tag_accounts_tag_account_id
      LEFT JOIN tags ON tag_id=tag_account_name;
    `
    )

    bsList = prepareResponse(bsList)
    console.log('bsList', JSON.stringify(bsList, null, 2))

    // Set response
    return Responses.ok200(event.httpMethod, bsList, event.headers)
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

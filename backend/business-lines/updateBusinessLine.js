const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Business Line ID
  let business_line_id = event.pathParameters.business_line_id

  if (!business_line_id) {
    // Set response
    return Responses.error404(event.httpMethod, `Error al actualizar Business Line ID: ${business_line_id}.`, event.headers)
  }

  const db = await dbConnection.connect()

  try {
    // Body
    let body = JSON.parse(event.body)
    console.log('Updating existing business_line => ', JSON.stringify(body))

    // Body validation
    makeSchemaValidation(body, requestBodySchemas.businessLines)

    // Update data
    await db
      .transaction()
      .query('UPDATE business_lines SET business_line_name=?, business_line_color=? WHERE business_line_id=?;', [
        body.business_line_name,
        body.business_line_color,
        business_line_id,
      ])
      .query('DELETE FROM business_lines_apis WHERE business_lines_apis_business_line_id=?;', [business_line_id])
      .query('INSERT INTO business_lines_apis (business_lines_apis_api_id, business_lines_apis_business_line_id) VALUES ?;', [
        body.business_line_apis.map((id) => {
          return [id, business_line_id]
        }),
      ])
      .query('DELETE FROM business_lines_tag_accounts WHERE business_lines_tag_accounts_business_line_id=?;', [business_line_id])
      .query(
        'INSERT INTO business_lines_tag_accounts (business_lines_tag_accounts_tag_account_id, business_lines_tag_accounts_business_line_id) VALUES ?;',
        [
          body.business_line_apis_tag_accounts.map((id) => {
            return [id, business_line_id]
          }),
        ]
      )
      .rollback((e) => {
        console.error('Rollback.Error => ', e)
      })
      .commit()
    db.quit()

    // Set response
    return Responses.ok204(event.httpMethod, event.headers)
  } catch (e) {
    console.error('error => ', e)

    // Set response
    return Responses.error400(event.httpMethod, `Error al actualizar Business Line ID: ${business_line_id}.`, event.headers)
  }
}

module.exports = {
  handler,
}

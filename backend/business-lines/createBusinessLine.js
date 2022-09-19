const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const Responses = require('../utils/response')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  // Body
  let body = JSON.parse(event.body)
  console.log('Inserting new business_line => ', JSON.stringify(body))
  const db = await dbConnection.connect()
  try {
    // Body validation
    makeSchemaValidation(body, requestBodySchemas.businessLines)

    // Insert data
    let business_line_id = -1
    await db
      .transaction()
      .query('INSERT INTO business_lines SET business_line_name=?, business_line_color=?;', [
        body.business_line_name,
        body.business_line_color,
      ])
      .query((r) => {
        business_line_id = r.insertId
        console.log('transaction.business_line_id', business_line_id)

        let bsIdList = body.business_line_apis.map((id) => {
          return [id, business_line_id]
        })
        console.log('transaction.bsIdList', bsIdList, JSON.stringify(bsIdList))

        return [
          `INSERT INTO business_lines_apis (business_lines_apis_api_id, business_lines_apis_business_line_id) VALUES ?`,
          [bsIdList],
        ]
      })
      .query(() => {
        let bsTagList = body.business_line_apis_tag_accounts.map((id) => {
          return [id, business_line_id]
        })
        console.log('transaction.bsTagList', bsTagList, JSON.stringify(bsTagList))

        return [
          `INSERT INTO business_lines_tag_accounts (business_lines_tag_accounts_tag_account_id, business_lines_tag_accounts_business_line_id) VALUES ?`,
          [bsTagList],
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
      e?.errno === 1062 ? `La Línea de Negocio '${body.business_line_name}' ya existe!.` : 'Error al crear la Línea de Negocio.',
      event.headers
    )
  }
}

module.exports = {
  handler,
}

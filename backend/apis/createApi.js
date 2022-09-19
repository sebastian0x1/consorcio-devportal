const dbConnection = require('../utils/dbConnection')
const { requestBodySchemas, makeSchemaValidation } = require('../utils/joiSchemas')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const { s3UploadFile } = require('../utils/s3')
const Responses = require('../utils/response')
const { addVpcE } = require('../utils/swaggerVpcConverter')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  let apiApiId = uuidv4()

  let body = parseBody(event)

  const db = await dbConnection.connect()

  let isUnique = await checkDuplicateApi(body, apiApiId, db)

  if (isUnique) {
    try {
      // Body validation
      makeSchemaValidation(body, requestBodySchemas.apis.createApi)
      let stage_name
      // Get stage name from DB
      try {
        stage_name = await db.query(`SELECT stage_name FROM stages WHERE stage_id=?;`, [body.api_stage_id])
        stage_name = stage_name.shift()
        stage_name = stage_name.stage_name
        if (!stage_name) throw new Error(`Stage con ID ${body.api_stage_id} no existe.`)
      } catch (e) {
        console.log(`Stage con ID ${body.api_stage_id} no existe.`, e)
      } finally {
        db.quit()
      }

      body.api_file.content = JSON.stringify(await addVpcE(JSON.parse(body.api_file.content)))

      // Upload file
      await s3UploadFile({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: path.join('apis/', apiApiId, body.api_tag_account_name, stage_name.toLowerCase(), 'swagger.' + body.api_file.type),
        Body: body.api_file.content,
        ACL: 'private',
      })

      // Insert data
      console.log('Inserting to DB...')
      let api_id = -1
      await db
        .transaction()
        .query('INSERT INTO apis SET api_apiid=?, api_name=?, api_color=?, api_is_external=1;', [
          apiApiId,
          body.api_name,
          body.api_color,
        ])
        .query((r) => {
          api_id = r.insertId
          return [`INSERT INTO apis_stages (apis_stages_api_id, apis_stages_stage_id) VALUES (?, ?)`, [api_id, body.api_stage_id]]
        })
        .query(() => {
          return [
            `INSERT INTO apis_tag_accounts (apis_tag_accounts_tag_account_id, apis_tag_accounts_api_id) VALUES (?, ?)`,
            [body.api_tag_account_id, api_id],
          ]
        })
        .rollback((e) => {
          console.error('Rollback.Error => ', e)
        })
        .commit()

      // Set response
      return Responses.ok204(event.httpMethod, event.headers)
    } catch (e) {
      console.error(e)
      // Set response
      return Responses.error400(event.httpMethod, 'Error al crear la API.', event.headers)
    } finally {
      db.quit()
    }
  } else {
    return Responses.error409(event.httpMethod, 'El nombre de la api existe en este ambiente para esta versión.', event.headers)
  }
}

const parseBody = (event) => {
  try {
    return JSON.parse(event.body)
  } catch (e) {
    console.log(e)
    return Responses.error400(event.httpMethod, 'Error al crear la API.', event.headers)
  }
}

const checkDuplicateApi = async (body, apiId, db) => {
  let isUnique = true
  if (!db) db = await dbConnection.connect()
  try {
    const apisNames = await db.query(`
      SELECT apis.api_name,
      apis.api_is_external,
      apis.api_color,
      apis.api_id,
      tag_accounts.tag_account_id,
      stages.stage_id,
      stages.stage_active
      
      FROM apis 
      JOIN apis_tag_accounts ON apis.api_id = apis_tag_accounts.apis_tag_accounts_api_id
      JOIN tag_accounts ON tag_accounts.tag_account_id = apis_tag_accounts.apis_tag_accounts_tag_account_id
      JOIN apis_stages ON apis.api_id = apis_stages.apis_stages_api_id 
      JOIN stages ON stages.stage_id = apis_stages.apis_stages_stage_id 
      ;`)

    const result = apisNames.filter(function (currentElement) {
      if (
        currentElement.api_name === body.api_name &&
        currentElement.stage_id === body.api_stage_id &&
        currentElement.tag_account_id === body.api_tag_account_id &&
        currentElement.api_is_external !== 0
      ) {
        return true
      }
    })
    console.log('result', result)
    if (result.length >= 1) {
      if (result[0].api_id == apiId) {
      } else {
        isUnique = false
      }
    }
    return isUnique
  } catch (e) {
    console.log(e)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
  checkDuplicateApi,
  parseBody,
}

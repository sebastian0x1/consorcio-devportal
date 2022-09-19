const dbConnection = require('../utils/dbConnection')

/**
 * Gets all Apis from database
 *
 */
async function getRestApisFromDB(apiId = '') {
  console.log('apiManagerDB.js - getAllRestApiFromDB')

  let apisDB = []

  const db = await dbConnection.connect()
  try {
    apisDB = await db.query(
      ` SELECT  api_id, 
                api_apiid,
                apis.api_name,
                apis_stages_id,
                apis_stages_api_hash,
                apis_stages_stage_id,
                stages.stage_name
        FROM apis_stages
        LEFT JOIN apis ON apis.api_id = apis_stages.apis_stages_api_id
        LEFT JOIN stages ON stages.stage_id = apis_stages.apis_stages_stage_id
        WHERE api_is_external=0 AND api_apiid LIKE ?
        `,
      ['%' + apiId]
    )
  } catch (error) {
    console.log(error)
  } finally {
    db.quit()
  }

  return apisDB
}

/**
 * Inserts a rest api to the DB
 *
 * @param {*} api
 * @param {*} apiStage
 * @param {*} apiHash
 * @return {*}
 */
async function insertApiAndStageDB(api, stage, apiHash, tagAccount = 'default') {
  console.log('apiManagerDB.js => insertApiAndStageDB')
  console.log(
    `apiManagerDB.js => insertApiAndStageDB, ${JSON.stringify(api)}, ${JSON.stringify(stage)}, ${apiHash}, ${tagAccount}`
  )
  let api_id
  let stage_id
  // let tagAccountId = null

  const db = await dbConnection.connect()

  await db
    .transaction()
    .query(() => {
      return [`SELECT tag_account_id FROM tag_accounts WHERE tag_account=?;`, [tagAccount]]
    })
    .query((r) => {
      console.log('tag_account r: ', r)
      const result = Object.values(JSON.parse(JSON.stringify(r)))
      console.log('result', result)
      // tagAccountId = result[0].tag_account_id
      // console.log('tagAccountId', tagAccountId)
      return [
        `INSERT IGNORE INTO apis SET api_apiid=?, api_name=?, api_is_external=0, api_created_at=?;`,
        [api.id, api.name, api.createdAt],
      ]
    })
    .query((r) => {
      console.log('r1: ', r.insertId)

      if (r.insertId !== 0) {
        api_id = r.insertId
        return ['select 1']
      } else
        return [
          `
              SELECT api_id
              FROM apis
              WHERE api_apiid='${api.id}'
          `,
        ]
    })
    .query((r) => {
      console.log('r2: ', r)

      if (!api_id) api_id = r[0].api_id

      return [`INSERT IGNORE INTO stages (stage_name,stage_created_at) VALUES (?,?)`, [stage.name.toLowerCase(), stage.createdAt]]
    })
    .query((r) => {
      console.log('r3: ', r.insertId)

      if (r.insertId !== 0) {
        stage_id = r.insertId
        return ['select 1']
      } else
        return [
          `
              SELECT stage_id
              FROM stages
              WHERE stage_name='${stage.name}'
          `,
        ]
    })
    .query((r) => {
      if (!stage_id) stage_id = r[0].stage_id

      console.log('stage_id: ', stage_id)
      console.log('api_id: ', api_id)

      return [
        `INSERT IGNORE INTO apis_stages (apis_stages_api_id, apis_stages_stage_id, apis_stages_api_hash, apis_stages_api_created_at) VALUES (?, ?, ?, ?)`,
        [api_id, stage_id, apiHash, stage.createdAt],
      ]
    })
    .query(() => {
      return [
        `
        SELECT tag_account_id
        FROM tag_accounts
        WHERE tag_account='${api.account}'
      `,
      ]
    })
    .query((r) => {
      return [
        `INSERT IGNORE INTO apis_tag_accounts (apis_tag_accounts_tag_account_id, apis_tag_accounts_api_id) VALUES (?, ?)`,
        [r[0].tag_account_id, api_id],
      ]
    })
    .rollback((e) => {
      console.error(`apiManagerDB.js => insertApiAndStageDB - ${e.status} - ${e.message}`)
    })
    .commit()
  db.quit()
}

/**
 * Updates a rest api record from the DB
 *
 * @param {*} apiId
 * @param {*} apiStage
 * @param {*} apiName
 * @param {*} apiHash
 * @return {*}
 */
async function updateApiDB(api, apiStage, apiHash, apisStagesId) {
  console.log('apiManagerDB.js => updateApiDB - apisStagesId: ', apisStagesId)

  const db = await dbConnection.connect()
  try {
    await db.query('UPDATE apis_stages SET apis_stages_api_hash=?, apis_stages_api_updated_at= now() WHERE apis_stages_id=?;', [
      apiHash,
      apisStagesId,
    ])
  } catch (error) {
    console.error('apiManagerDB.js - updateApiDB - apisStagesId => ', error)
  } finally {
    db.quit()
  }
}

/**
 * Inserts a rest api to the DB
 *
 * @param {*} api
 * @param {*} apiStage
 * @param {*} apiHash
 * @return {*}
 */
async function insertApiDB(api, stage, apiHash) {
  console.log('apiManagerDB.js => insertApiAndStageDB')

  let api_id
  let stage_id

  const db = await dbConnection.connect()
  try {
    await db.query(() => {
      return [
        `INSERT IGNORE INTO apis SET api_apiid=?, api_name=?, api_is_external=0, api_created_at=?;`,
        [api.id, api.name, api.createdAt],
      ]
    })
  } catch (error) {
    console.error('apiManagerDB.js - deleteApiStageRelationFromDB => ', error)
  } finally {
    db.quit()
  }
}

async function deleteRestApiAndRelationFromDB(apiId) {
  console.log('apiManagerDB.js - deleteRestApiAndRelationFromDB => apiId: ', apiId)
  if (!apiId) return false
  let isDeleted = true
  const db = await dbConnection.connect()
  try {
    await db.query('DELETE FROM apis WHERE api_apiid=?;', [apiId])
  } catch (error) {
    console.error('apiManagerDB.js - deleteRestApiAndRelationFromDB => ', error)
    isDeleted = false
  } finally {
    db.quit()
  }
  return isDeleted
}

async function deleteApiStageRelationFromDB(apiId, apiStage) {
  console.log(`apiManagerDB.js - deleteApiStageRelationFromDB => apiId: ${apiId} - apiStage: ${apiStage}`)
  if (!(apiId && apiStage)) return false
  let isDeleted = true
  let dbApiId

  const db = await dbConnection.connect()
  try {
    await db
      .transaction()
      .query(() => {
        return ['SELECT api_id FROM apis WHERE api_apiid = ?;', [apiId]]
      })
      .query((r) => {
        console.log('apiManagerDB.js - deleteApiStageRelationFromDB => dbApiId: ', r)
        if (r.length > 0) {
          dbApiId = r[0].api_id
          return ['SELECT stage_id FROM stages WHERE stage_name = ?;', [apiStage]]
        } else {
          return ['select 1']
        }
      })
      .query((r) => {
        console.log('apiManagerDB.js - deleteApiStageRelationFromDB => stageId: ', r)
        if (r.length > 0) {
          let stageId = r[0].stage_id
          return ['DELETE FROM apis_stages WHERE apis_stages_api_id=? AND apis_stages_stage_id=?;', [dbApiId, stageId]]
        } else {
          isDeleted = false
          return ['select 1']
        }
      })
      .query((r) => {
        console.log('apiManagerDB.js - deleteApiStageRelationFromDB => Result: ', r)
        if (r.affectedRows == 0) {
          console.log('apiManagerDB.js - deleteApiStageRelationFromDB => Relation not deleted')
          isDeleted = false
        }
      })
      .query((r) => {
        if (dbApiId) {
          console.log('apiManagerDB.js - Checking if API does not have Stages: ', r)
          return [
            'DELETE FROM apis WHERE apis.api_is_external=0 AND apis.api_id = ? AND apis.api_id NOT IN (SELECT distinct apis_stages_api_id FROM apis_stages)',
            [dbApiId],
          ]
        } else {
          return ['select 1']
        }
      })
      .query((r) => {
        console.log('apiManagerDB.js - deleteApiStageRelationFromDB => RestApi deleting result: ', r)
        if (r?.affectedRows != 0) {
          console.log('apiManagerDB.js - deleteApiStageRelationFromDB => RestApi deleted')
        } else {
          console.log('apiManagerDB.js - deleteApiStageRelationFromDB => RestApi did not delete, it has stages')
        }
        return ['select 1']
      })
      .rollback((e) => {
        console.log(`${e.status} - ${e.message}`, 'apiManagerDB.js')
        isDeleted = false
      })
      .commit()
  } catch (error) {
    console.error('apiManagerDB.js - deleteApiStageRelationFromDB => ', error)
    isDeleted = false
  } finally {
    db.quit()
  }

  return isDeleted
}

/**
 * Removes orphan Api Rest from database
 *
 */
async function removeOrphanApiRest() {
  console.log('apiManagerDB.js - removeOrphanApiRest')

  const db = await dbConnection.connect()
  try {
    console.log(
      await db.query(
        ` DELETE FROM apis
      WHERE apis.api_is_external=0 AND apis.api_id NOT IN
        (SELECT distinct apis_stages_api_id FROM apis_stages)
        `
      )
    )
  } catch (error) {
    console.error(error)
  } finally {
    db.quit()
  }
}

module.exports = {
  insertApiAndStageDB,
  insertApiDB,
  updateApiDB,
  deleteRestApiAndRelationFromDB,
  deleteApiStageRelationFromDB,
  getRestApisFromDB,
  removeOrphanApiRest,
}

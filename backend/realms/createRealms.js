require('dotenv').config()
const dbConnection = require('../utils/dbConnection')
const { realms_dev } = require('./realms')
const { realms_qa } = require('./realms')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false

  const db = await dbConnection.connect()

  let stages = await db.query('SELECT stage_id, stage_name FROM stages WHERE stage_name LIKE "dev%" OR stage_name = "qa";')

  let stage_dev = stages.find((stage) => stage.stage_name.includes('dev'))
  let stage_qa = stages.find((stage) => stage.stage_name.includes('qa'))

  if (!stage_dev) {
    await insertStageToDb(db, 'dev')
    let stage = await db.query('SELECT stage_id, stage_name FROM stages WHERE stage_name LIKE "dev%"')
    stage_dev = stage.shift()
  }

  if (!stage_qa) {
    await insertStageToDb(db, 'qa')
    let stage = await db.query('SELECT stage_id, stage_name FROM stages WHERE stage_name = "qa";')
    stage_qa = stage.shift()
  }

  for (const realm of realms_dev) {
    await insertToDb(db, stage_dev.stage_id, realm)
  }

  for (const realm of realms_qa) {
    await insertToDb(db, stage_qa.stage_id, realm)
  }

  db.quit()
}

async function insertToDb(db, stage_id, reamlData) {
  return db.query(`INSERT IGNORE INTO realms (realm_name,realm_stage,realm_endpoint) VALUES (?, ?, ?);`, [
    reamlData.realm_name,
    stage_id,
    reamlData.realm_endpoint,
  ])
}

async function insertStageToDb(db, stage_name) {
  let stage = {
    stage_name: stage_name.toLowerCase(),
    stage_color: 'grey',
    stage_active: 1,
  }

  await db.query('INSERT INTO stages (stage_name,stage_color,stage_active) VALUES (?, ?, ?);', [
    stage.stage_name,
    stage.stage_color,
    stage.stage_active,
  ])
}

module.exports = {
  handler,
}

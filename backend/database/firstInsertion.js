require('dotenv').config()
const AWS = require('aws-sdk')
const dbConnection = require('../utils/dbConnection')
const fs = require('fs')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('firstInsertion.js - handler')

  let schema = fs.readFileSync('../../database/MySQL/tables/schema.sql').toString()
  let inserts = fs.readFileSync('../../database/MySQL/queries/first_inserts.sql').toString()

  const db = await dbConnection.connect()

  try {
    console.log(await db.query(schema))
    console.log(await db.query(inserts))
  } catch (error) {
    console.error(error)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

require('dotenv').config()
const AWS = require('aws-sdk')
const dbConnection = require('../utils/dbConnection')
const fs = require('fs')
var path = require('path')
const DB_NAME = process.env.MYSQL_DATABASE
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

async function handler(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('createTables.js - handler')
  console.log('Path:', __dirname)

  await createDb()

  await createTablesAndInserts()

  return 'Create Tables finished'
}

async function createDb() {
  const ssmClient = new SecretsManagerClient({ region: process.env.REGION })

  const command = new GetSecretValueCommand({
    SecretId: process.env.DB_ARN_SECRET,
  })

  const dbParams = await ssmClient.send(command)

  const tempDb = require('serverless-mysql')({
    config: {
      host: process.env.MYSQL_HOST,
      user: JSON.parse(dbParams.SecretString).MYSQL_USER,
      password: JSON.parse(dbParams.SecretString).MYSQL_PASSWORD,
    },
  })

  try {
    console.log(await tempDb.query('CREATE DATABASE IF NOT EXISTS ??', DB_NAME))
  } catch (error) {
    console.error(error)
  } finally {
    tempDb.quit()
  }
}

async function createTablesAndInserts() {
  let options = {
    encoding: 'utf8',
  }

  let schema = fs.readFileSync(path.join(__dirname, './schema.sql'), options)
  console.log('schema', schema)
  let inserts = fs.readFileSync(path.join(__dirname, './first_inserts.sql'), options)
  console.log('inserts', inserts)

  let schemaArray = schema.split(';')
  let insertsArray = inserts.split(';')

  schemaArray.pop()
  insertsArray.pop()

  console.log('schemaArray', schemaArray)
  console.log('Inserts:', insertsArray)

  const db = await dbConnection.connect()

  try {
    for (const element of schemaArray) {
      console.log(await db.query(element))
    }

    for (const element of insertsArray) {
      console.log(await db.query(element))
    }
  } catch (error) {
    console.error(error)
  } finally {
    db.quit()
  }
}

module.exports = {
  handler,
}

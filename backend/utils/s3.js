'use strict'
const { S3 } = require('./awsClient')
const path = require('path')

let cached_roles = null

/**
 * Upload a file to an especified bucket
 *
 * @param {*} { Bucket, Key, Body }
 */
const s3UploadFile = async ({ Bucket, Key, Body, ACL }) => {
  console.log('s3.js - s3UploadFile => Bucket: ', Bucket)
  console.log('s3.js - s3UploadFile => key: ', Key)
  console.log('s3.js - s3UploadFile => ACL: ', ACL)
  const params = {
    Bucket,
    Key,
    Body,
    ACL,
  }
  console.log(params)
  let data = await S3.upload(params).promise()
  console.log('s3.js - s3UploadFile => File uploaded successfully', data.Location)
  console.log('s3.js - s3UploadFile => Bucket: ', Bucket)
}

const s3GetFile = async ({ Bucket, Key }) => {
  return S3.getObject({
    Bucket,
    Key,
  }).promise()
}

const s3DeleteFile = async ({ Bucket, Key }) => {
  await S3.deleteObject({
    Bucket,
    Key,
  }).promise()
  console.log('s3.js - s3DeleteFile => File deleted successfully')
}

const s3CopyFile = async ({ Bucket, Key, CopySource }) => {
  await S3.copyObject({
    Bucket,
    CopySource,
    Key
  }).promise()
  console.log('s3.js - s3UploadFile => File uploaded successfully')
}

async function fetchSwaggerDocuments(apiId, tag_account, stage, filename = 'swagger.json') {
  try {
    let key = path.join('apis/', apiId, tag_account, stage, filename)
    console.log('fetchSwaggerDocuments.S3Bucket =>', process.env.S3_BUCKET_NAME)
    console.log('fetchSwaggerDocuments.key =>', key)

    let fileContent = await s3GetFile({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })
    console.log('fileContent', fileContent)
    console.log('JSON.parse(fileContent.Body.toString()', JSON.parse(fileContent.Body.toString()))

    return JSON.parse(fileContent.Body.toString())
  } catch (e) {
    console.log(e)
  }
}

async function fetchRolesConfiguration(role) {
  if (!cached_roles) {
    cached_roles = await fetchSwaggerDocuments('', process.env.S3_BUCKET_ROLES)
  }

  console.log('fetchRolesConfiguration.cached_roles =>', cached_roles)
  return cached_roles[role]
}

module.exports = {
  fetchRolesConfiguration,
  fetchSwaggerDocuments,
  s3UploadFile,
  s3DeleteFile,
  s3GetFile,
  s3CopyFile
}

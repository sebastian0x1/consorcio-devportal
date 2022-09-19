const { s3GetFile, s3UploadFile } = require('../utils/s3')
const YAML = require('yamljs')
const fs = require('fs');

const handler = async (event, context) => {
  try {
    const paramsS3 = setKey(event)
    const res = await s3GetFile(paramsS3)
    const newParams = await getPath(res, paramsS3)
    console.log('res => ', newParams)
    await s3UploadFile(newParams)
    return '200 ok'
  } catch (error) {
    console.log('error', error)
    return 'error'
  }

}

const getPath = async (res, paramsS3) => {
  fs.writeFileSync('/tmp/file.yaml', res.Body)
  const fileContent = fs.readFileSync('/tmp/file.yaml', 'utf-8')
  const newParams = await transform(fileContent, paramsS3)
  return newParams
}

const setKey = (event) => {
  try {
    let key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
    let paramsBucketRead = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ACL: 'private'
    }
    return paramsBucketRead
  } catch (e) {
    console.log('parametros bucket errados', e)
  }
}

const transform = async (file, params) => {
  try {
    let nativeObject = YAML.parse(file)
    console.log('nativeObject', JSON.stringify(nativeObject))
    params.Key = params.Key.replace(/yaml|yml/, 'json')
    params.Body = JSON.stringify(nativeObject)
    console.log('params stringify', params)
    return params
  } catch (error) {
    console.log('error', error)
    return error
  }
}

module.exports = {
  handler,
}




exports.handler = function (event, context) {
  fs.writeFile("/tmp/test.txt", "testing", function (err) {
    if (err) {
      context.fail("writeFile failed: " + err);
    } else {
      context.succeed("writeFile succeeded");
    }
  });
};
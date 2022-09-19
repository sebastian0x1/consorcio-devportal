const { s3UploadFile, s3GetFile, s3DeleteFile, fetchSwaggerDocuments, fetchRolesConfiguration } = require('../../utils/s3')
const AWS = require('aws-sdk')

describe('S3 Service', () => {
  beforeAll(() => {})
  afterAll(() => {})

  test('s3UploadFile', async () => {})

  test('s3GetFile', async () => {
    spyS3.mockClear()
  })

  test('s3DeleteFile', async () => {
    spyS3.mockClear()
  })

  test('fetchSwaggerDocuments', async () => {
    spyS3.mockClear()
  })

  test('fetchRolesConfiguration', async () => {
    spyS3.mockClear()
  })
})

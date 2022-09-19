const AWS = require('aws-sdk')
const sts = new AWS.STS()

/**
 * Gets an apiGateway client for an specific account
 *
 * @param {*} account
 * @return {*} 
 */
 const getApiGatewayClient = async (account) => {
    console.log(`getCredentials.js - getApiGatewayClient => account: ${account}`)
    const params = await getCrossAccountCredentials(account)
    params.region = process.env.REGION
  
    return new AWS.APIGateway(params)
  }
  
  
  /**
   * Gets credentials assuming role for an specific account
   *
   * @param {*} account
   * @return {*} 
   */
  const getCrossAccountCredentials = async (account) => {
    console.log(`getCredentials.js - getCrossAccountCredentials`)
    return new Promise((resolve, reject) => {
      const timestamp = new Date().getTime()
      const params = {
        RoleArn: `arn:aws:iam::${account}:role/role_to_be_assume`, // TODO: ver con Arquitectura como estandarizar los roles o buscar la manera de identificarlo
        RoleSessionName: `to-read-all-apis-${timestamp}`,
      }
      sts.assumeRole(params, (err, data) => {
        if (err) reject(err)
        else {
          resolve({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken,
          })
        }
      })
    })
  }

  module.exports = {
    getApiGatewayClient,
  }
  
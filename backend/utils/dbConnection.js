let connection

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

const ssmClient = new SecretsManagerClient({ region: process.env.REGION })

const command = new GetSecretValueCommand({
  SecretId: process.env.DB_ARN_SECRET,
})

const connect = async () => {
  if (!connection) {
    const config = await ssmClient.send(command)
    connection = require('serverless-mysql')({
      config: {
        host: process.env.MYSQL_HOST,
        user: JSON.parse(config.SecretString).MYSQL_USER,
        password: JSON.parse(config.SecretString).MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      },
    })
  }
  return connection
}

module.exports = { connect }

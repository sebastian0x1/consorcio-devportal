const axios = require('axios')

const reqURL = `https://hooks.slack.com/services/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`

const green = '#1ed760'
const red = '#f70000'

async function notifySlack(data) {
  const fields = []
  data.body = JSON.parse(data.body)
  console.log('data.body.deploys => ', data.body.deploys)
  try {
    for (const resource of data.body.deploys) {
      fields.push({
        title: resource.type,
        value: `Version: ${resource.version} ${resource.change === true ? ':large_green_circle:' : ':heavy_minus_sign:'}`,
        short: true,
        icon: ':aws:',
      })
    }

    const message = {
      channel: 'cs_deploys',
      username: `${data.body.env.toUpperCase()} DEPLOYMENT`,
      // text: 'Jenkins: Open Jenkins Build server here',
      icon_emoji: ':aws:',
      attachments: [
        {
          color: data.body.status === 'success' ? green : red,
          fields: fields,
        },
      ],
    }

    return axios.post(reqURL, message)
  } catch (error) {
    return axios.post(reqURL, {
      channel: 'cs_deploys',
      username: 'ERROR EN deploymentNotification.js',
      // text: 'Jenkins: Open Jenkins Build server here',
      icon_emoji: ':aws:',
      attachments: [
        {
          color: red,
          fields: [
            {
              title: error.message,
              value: error,
              short: true,
              icon: ':aws:',
            },
          ],
        },
      ],
    })
  }
}

exports.handler = async (event, context, callback) => {
  console.log('event =>', event)
  // console.log('JSON.stringify(event) =>', JSON.stringify(event))
  // console.log('JSON.stringify(event.body) =>', JSON.stringify(event.body))

  context.callbackWaitsForEmptyEventLoop = false
  const records = event.Records.pop()
  console.log('records => ', records)
  await notifySlack(records)
}

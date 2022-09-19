/**
 * Checks how to continue the flow
 *
 * @param {{configurationItem: object, resourceType: object, configurationItemStatus: object, resourceId: string}} event
 */
async function handler(event, context) {
  console.log('triggeredByConfig.js - triggeredByAwsConfig => event:', event)
  let apiId
  let message = event?.message
  let account = event?.message?.configurationItem?.awsAccountId
  console.log('triggeredByConfig.js - triggeredByAwsConfig => account:', account)

  if (!message.resourceType.includes('ApiGateway') || !account) return // ApiGateway has not changed or Account is NULL
  if (!['ResourceDeleted', 'OK', 'ResourceDiscovered'].includes(message.configurationItemStatus)) return

  apiId = message.resourceId.split('/')[2]

  if (message.configurationItemStatus === 'ResourceDeleted') {
    return {
      apiId,
      account,
      process: 'delete',
    }
  }

  return {
    apiId,
    account,
    process: 'addOrUpdate',
  }
}

module.exports = {
  handler,
}

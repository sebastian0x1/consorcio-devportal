'use strict'

const addVpcE = async (apiContentBody) => {
  // is a swagger file
  if (apiContentBody['x-amazon-apigateway-endpoint-configuration']?.vpcEndpointIds?.length) {
    let vpcEndpointId = apiContentBody['x-amazon-apigateway-endpoint-configuration']?.vpcEndpointIds[0]
    let hostParts = apiContentBody.host.split('.')
    hostParts[0] = hostParts[0].concat(`-${vpcEndpointId}`)
    apiContentBody.host = hostParts.join('.')
  }

  // is a openapi file
  else if (apiContentBody.servers) {
    apiContentBody.servers.forEach((server) => {
      if (server['x-amazon-apigateway-endpoint-configuration']?.vpcEndpointIds?.length) {
        let vpcEndpointId = server['x-amazon-apigateway-endpoint-configuration']?.vpcEndpointIds[0]
        let hostParts = server.url.split('.')
        hostParts[0] = hostParts[0].concat(`-${vpcEndpointId}`)
        server.url = hostParts.join('.')
      }
    })
  }

  return apiContentBody
}

module.exports = { addVpcE }

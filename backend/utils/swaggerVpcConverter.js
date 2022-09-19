'use strict'

const addVpcE = async (swaggerBody) => {
  if (swaggerBody['x-amazon-apigateway-endpoint-configuration']?.vpcEndpointIds?.length) {
    let vpcEndpointId = swaggerBody['x-amazon-apigateway-endpoint-configuration']?.vpcEndpointIds[0]
    let hostParts = swaggerBody.host.split('.')
    hostParts[0] = hostParts[0].concat(`-${vpcEndpointId}`)
    swaggerBody.host = hostParts.join('.')
  }

  return swaggerBody
}

module.exports = { addVpcE }

const slsinfo = require('fs').readFileSync('../.slsinfo', 'utf8')

function getVariables(output) {
  let found = slsinfo.match(new RegExp('(' + output + ': )((.?)+)(\\n)'))[2]
  console.log('found: ', found)
  return found
}

function getApiGatewayUrl() {
  let apiGatewayDomain = getVariables('AwsDocApiId')
  let stage = getVariables('stage')
  let region = getVariables('region')

  let apiGatewayURL = 'https://' + apiGatewayDomain + '.execute-api.' + region + '.amazonaws.com/' + stage
  console.log('apiGatewayURL: ', apiGatewayURL)
}

function changeLambdaEnvironmentVariables() {
  var params = {
    FunctionName: 'STRING_VALUE' /* required */,
    Qualifier: 'STRING_VALUE',
  }
  let lambdaConfigurations = await getFunctionConfiguration((params = params), callback)
}

let apiGatewayUrl = getApiGatewayUrl()

import API_APIS from './apis'
import API_AUTH from './login'
import API_BUSINESS_LINES from './business_lines'
import API_STAGES from './stages'
import API_SWAGGER from './swagger'
import API_ROLES from './roles'
import API_USERS from './users'
import API_CREDENTIAL_TOKEN from './credential_token'

const Api = {
  ...API_APIS,
  ...API_AUTH,
  ...API_BUSINESS_LINES,
  ...API_STAGES,
  ...API_SWAGGER,
  ...API_ROLES,
  ...API_USERS,
  ...API_CREDENTIAL_TOKEN,
}

export default Api

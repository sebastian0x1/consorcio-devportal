const Joi = require('joi')

const requestBodySchemas = {
  apis: {
    createApi: Joi.object().keys({
      api_name: Joi.string().min(2).max(50).required(),
      api_color: Joi.string().min(2).max(10).required(),
      api_tag_account_id: Joi.number().min(0).required(),
      api_tag_account_name: Joi.string().min(2).max(10).required(),
      api_stage_id: Joi.number().integer().min(1).required(),
      api_file: Joi.object()
        .keys({
          content: Joi.string().required(),
          type: Joi.string().valid('yaml', 'yml', 'json').required(),
        })
        .required(),
    }),
    updateApi: Joi.object().keys({
      api_name: Joi.string().min(2).max(50).required(),
      api_color: Joi.string().min(2).max(10).required(),
      api_tag_account_id: Joi.number().min(0).optional(),
      api_tag_account_name: Joi.string().min(2).max(10).required(),
      api_stage_id: Joi.number().integer().min(1).required(),
      api_stage: Joi.string().min(2).max(50).required(),
      last_path: Joi.string().min(2).max(50).required(),
    }),
  },
  auth: {
    login: Joi.object().keys({
      username: Joi.string().min(2).max(150).required(),
      password: Joi.string().min(2).max(150).required(),
    }),
    refreshTokens: Joi.object().keys({
      username: Joi.string().min(2).max(100).required(),
      refresh_token_previous_login: Joi.string().min(2).required(),
      isADUser: Joi.boolean(),
    }),
  },
  businessLines: Joi.object().keys({
    business_line_name: Joi.string().min(2).max(50).required(),
    business_line_apis_tag_accounts: Joi.array().items(Joi.number().integer()).required(),
    business_line_apis: Joi.array().items(Joi.number().integer()).required(),
    business_line_color: Joi.string().min(2).max(10).required(),
  }),
  stages: Joi.object().keys({
    stage_color: Joi.string().min(2).max(10).required(),
    stage_active: Joi.number().integer().required(),
  }),
  roles: Joi.object().keys({
    role_name: Joi.string().min(2).max(50).required(),
    role_description: Joi.string().allow(''),
    role_color: Joi.string().min(2).max(10).required(),
    role_business_lines: Joi.array().items(Joi.number().integer()).required(),
    role_permissions: Joi.array(),
  }),
  users: {
    createUser: Joi.object().keys({
      user_name: Joi.string().min(2).max(100).required(),
      user_email: Joi.string().min(2).max(100).required(),
      user_password: Joi.string().min(5).max(50).required(),
      user_role_id: Joi.number().integer().min(0),
    }),
    createUserSSO: Joi.object().keys({
      user_name: Joi.string().min(2).max(100).required(),
      user_email: Joi.string().min(2).max(100).required(),
      user_role_id: Joi.number().integer().min(0).required(),
      user_api_key: Joi.string().min(1).max(100).required(),
      user_id_cognito: Joi.string().min(1).max(100).required(),
      user_sub_cognito: Joi.string().min(1).max(100).required(),
      user_ad: Joi.boolean().required(),
    }),
    updateUser: Joi.object().keys({
      user_name: Joi.string().min(2).max(100).required(),
      user_role_id: Joi.number().integer().min(0),
      user_active: Joi.number().integer().required(),
    }),
    saveSsoCredentials: Joi.object().keys({
      ssoClientSecret: Joi.string().min(2).max(65).required(),
      ssoClientID: Joi.string().min(2).max(50).required(),
      ssoUsername: Joi.string().min(2).max(50),
      ssoPassword: Joi.string().min(2).max(50),
      realm: Joi.string().min(1).max(100).required(),
      grantType: Joi.string().min(1).max(20).required(),
    }),
    useSsoCredentials: Joi.object().keys({
      ssoClientSecret: Joi.string().min(2).max(65).required(),
      ssoClientID: Joi.string().min(2).max(50).required(),
      ssoUsername: Joi.string().min(2).max(50),
      ssoPassword: Joi.string().min(2).max(50),
      isADUser: Joi.boolean(),
      realm: Joi.string().min(1).max(100).required(),
      grantType: Joi.string().min(1).max(20).required(),
    }),
  },
}

function makeSchemaValidation(body, schema) {
  const { error, value } = schema.validate(body)

  if (error) {
    throw new Error(error)
  }
}

module.exports = {
  requestBodySchemas,
  makeSchemaValidation,
}

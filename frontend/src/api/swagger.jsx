import axiosApiInstance from './axios'

const API_SWAGGER = {
  getSwagger: async (is_mock, tag_account, stage, api_apiid) => {
    if (is_mock) {
      return {
        data: {
          api_apiid: 1,
          api_swagger: {
            swagger: '2.0',
            info: {
              title: 'Test #1 API',
              description: 'API description in Markdown.',
              version: '1.0.0',
            },
            host: 'api.example.com',
            basePath: '/v1',
            schemes: ['https'],
            paths: {
              '/users': {
                get: {
                  summary: 'Returns a list of users.',
                  description: 'Optional extended description in Markdown.',
                  produces: ['application/json'],
                  responses: {
                    200: {
                      description: 'OK',
                    },
                  },
                },
              },
            },
          },
        },
      }
    }

    const result = await axiosApiInstance.get(`/apis/swagger/${tag_account}/${stage}/${api_apiid}`)
    //console.log(result)
    return result
  },
}

export default API_SWAGGER

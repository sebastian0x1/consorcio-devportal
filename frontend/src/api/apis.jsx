import axiosApiInstance from './axios'

const API_APIS = {
  listAPIS: async (is_mock, role_id) => {
    //is_mock = true
    if (is_mock) {
      return {
        data: {
          business_lines: [
            {
              business_line_name: 'seguros vida',
              business_line_stages: [
                {
                  stage_name: 'develop',
                  stage_apis: [
                    {
                      api_id: 1,
                      api_apiid: 'abc456',
                      api_name: 'API: hola_vida_1',
                      api_is_external: true,
                      api_created_at: '2022-01-04 19:56:38',
                    },
                  ],
                },
                {
                  stage_name: 'qa',
                  stage_apis: [
                    {
                      api_id: 2,
                      api_apiid: 'abd1235',
                      api_name: 'API: hola_vida_2',
                      api_is_external: true,
                      api_created_at: '2022-01-04 19:56:38',
                    },
                    {
                      api_id: 3,
                      api_apiid: 'abs123',
                      api_name: 'API: hola_vida_3',
                      api_is_external: true,
                      api_created_at: '2022-01-04 19:56:38',
                    },
                  ],
                },
              ],
            },
            {
              business_line_name: 'seguros transporte',
              business_line_stages: [
                {
                  stage_name: 'qa',
                  stage_apis: [
                    {
                      api_id: 4,
                      api_apiid: 'abasd123',
                      api_name: 'API: hola_transporte',
                      api_is_external: true,
                      api_created_at: '2022-01-04 19:56:38',
                    },
                  ],
                },
              ],
            },
          ],
        },
      }
    }
    return axiosApiInstance.get(`/apis/menu/${role_id}`)
  },
  getAPIS: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          {
            api_id: 1,
            api_name: 'Api #1',
            api_color: 'red',
            api_stage_id: 1,
            api_stage: 'develop',
            api_stage_color: 'red',
            api_is_external: 0,
            api_created_at: '2022-01-07T22:05:23.000Z',
            api_updated_at: null,
          },
          {
            api_id: 1,
            api_name: 'Api #1',
            api_color: 'red',
            api_stage_id: 2,
            api_stage: 'qa',
            api_stage_color: 'red',
            api_is_external: 0,
            api_created_at: '2022-01-07T22:05:23.000Z',
            api_updated_at: null,
          },
          {
            api_id: 2,
            api_name: 'Api #2',
            api_color: 'red',
            api_stage_id: 1,
            api_stage: 'develop',
            api_stage_color: 'red',
            api_is_external: 0,
            api_created_at: '2022-01-07T22:05:23.000Z',
            api_updated_at: null,
          },
          {
            api_id: 3,
            api_name: 'Api #3',
            api_color: 'red',
            api_stage_id: 1,
            api_stage: 'develop',
            api_stage_color: 'red',
            api_is_external: 0,
            api_created_at: '2022-01-07T22:05:23.000Z',
            api_updated_at: null,
          },
          {
            api_id: 3,
            api_name: 'Api #3',
            api_color: 'red',
            api_stage_id: 3,
            api_stage: 'production',
            api_stage_color: 'red',
            api_is_external: 0,
            api_created_at: '2022-01-07T22:05:23.000Z',
            api_updated_at: null,
          },
        ],
      }
    }
    return axiosApiInstance.get(`/apis`)
  },
  createAPI: async (is_mock, apiData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.post(`/apis`, { ...apiData })
  },
  deleteAPI: async (is_mock, api_id) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.delete(`/apis/${api_id}`)
  },
  updateAPI: async (is_mock, api_id, apiData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.put(`/apis/${api_id}`, { ...apiData })
  },
  pingAPI: async (is_mock) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.get(`/pingApi`)
  },
}

export default API_APIS

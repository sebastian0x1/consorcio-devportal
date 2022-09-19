import axiosApiInstance from './axios'

const API_BUSINESS_LINES = {
  listBusinessLines: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          {
            business_line_id: 1,
            business_line_name: 'BS #1',
            business_line_color: 'olive',
            business_line_created_at: '2022-01-07T22:19:03.000Z',
            business_line_updated_at: '2022-01-07T22:19:03.000Z',
            business_line_apis: [
              {
                api_id: 1,
                api_name: 'Api #1',
                api_color: 'red',
              },
              {
                api_id: 2,
                api_name: 'Api #2',
                api_color: 'red',
              },
              {
                api_id: 3,
                api_name: 'Api #3',
                api_color: 'red',
              },
            ],
          },
          {
            business_line_id: 2,
            business_line_name: 'BS #2',
            business_line_color: 'olive',
            business_line_created_at: '2022-01-07T22:19:03.000Z',
            business_line_updated_at: '2022-01-07T22:19:03.000Z',
            business_line_apis: [
              {
                api_id: 2,
                api_name: 'Api #2',
                api_color: 'red',
              },
              {
                api_id: 3,
                api_name: 'Api #3',
                api_color: 'red',
              },
            ],
          },
          {
            business_line_id: 1,
            business_line_name: 'BS #1',
            business_line_color: 'olive',
            business_line_created_at: '2022-01-07T22:19:03.000Z',
            business_line_updated_at: '2022-01-07T22:19:03.000Z',
            business_line_apis: [
              {
                api_id: 1,
                api_name: 'Api #1',
                api_color: 'red',
              },
              {
                api_id: 3,
                api_name: 'Api #3',
                api_color: 'red',
              },
            ],
          },
        ],
      }
    }

    return axiosApiInstance.get(`/business-line`)
  },
  listAPIsForBusinessLine: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          {
            api_id: 1,
            api_names: 'Test #1',
            api_stage: 'v1'
          }
        ],
      }
    }

    return axiosApiInstance.get(`/business-line/apis`)
  },
  listTagsForBusinessLine: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          {
            tag_account_id: 1,
            tag_account_name: 'QA',
          }
        ],
      }
    }

    return axiosApiInstance.get(`/business-line/tagAccounts`)
  },
  createBusinessLines: async (is_mock, bsData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.post(`/business-line`, { ...bsData })
  },
  deleteBusinessLines: async (is_mock, bs_id) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.delete(`/business-line/${bs_id}`)
  },
  updateBusinessLines: async (is_mock, bs_id, bsData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.put(`/business-line/${bs_id}`, { ...bsData })
  },
}

export default API_BUSINESS_LINES

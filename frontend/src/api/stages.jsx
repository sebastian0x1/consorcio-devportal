import axiosApiInstance from './axios'

const API_STAGES = {
  getStages: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          { stage_id: 1, stage_name: 'develop', stage_color: 'red', stage_active: 1, stage_created_at: '2022-01-04 19:56:38' },
          {
            stage_id: 3,
            stage_name: 'production',
            stage_color: 'green',
            stage_active: 1,
            stage_created_at: '2022-01-04 19:56:38',
          },
          { stage_id: 2, stage_name: 'qa', stage_color: 'yellow', stage_active: 1, stage_created_at: '2022-01-04 19:56:38' },
        ],
      }
    }

    return axiosApiInstance.get(`/stages`)
  },
  updateStage: async (is_mock, stage_id, stagesData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.put(`/stages/${stage_id}`, { ...stagesData })
  },
}

export default API_STAGES

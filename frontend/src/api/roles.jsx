import axiosApiInstance from './axios'

const API_ROLES = {
  listRoles: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          {
            role_id: 1,
            role_name: 'ROLE TEST #1',
            role_description: 'Role Desc #1',
            role_color: 'teal',
            role_created_at: '2022-01-07T22:19:03.000Z',
            role_updated_at: '2022-01-07T22:19:03.000Z',
            role_business_lines: [
              {
                business_line_id: 1,
                business_line_name: 'BS TEST #1',
                business_line_color: 'green',
              },
              {
                business_line_id: 2,
                business_line_name: 'BS TEST #2',
                business_line_color: 'green',
              },
              {
                business_line_id: 3,
                business_line_name: 'BS TEST #3',
                business_line_color: 'green',
              },
            ],
            role_permissions: [
              {
                permissions_id: 5,
                permissions_name: 'ABM_ROLES',
                permission_color: 'red',
              },
              {
                permissions_id: 7,
                permissions_name: 'ABM_LINEAS_DE_NEGOCIOS',
                permission_color: 'red',
              },
              {
                permissions_id: 8,
                permissions_name: 'ABM_APIS',
                permission_color: 'red',
              },
            ],
          },
          {
            role_id: 2,
            role_name: 'ROLE TEST #2',
            role_description: 'Role Desc #2',
            role_color: 'teal',
            role_created_at: '2022-01-07T22:19:03.000Z',
            role_updated_at: '2022-01-07T22:19:03.000Z',
            role_business_lines: [
              {
                business_line_id: 2,
                business_line_name: 'BS TEST #2',
                business_line_color: 'green',
              },
              {
                business_line_id: 3,
                business_line_name: 'BS TEST #3',
                business_line_color: 'green',
              },
            ],
            role_permissions: [
              {
                permissions_id: 5,
                permissions_name: 'ABM_ROLES',
                permission_color: 'red',
              },
              {
                permissions_id: 8,
                permissions_name: 'ABM_APIS',
                permission_color: 'red',
              },
            ],
          },
          {
            role_id: 3,
            role_name: 'ROLE TEST #3',
            role_description: 'Role Desc #3',
            role_color: 'teal',
            role_created_at: '2022-01-07T22:19:03.000Z',
            role_updated_at: '2022-01-07T22:19:03.000Z',
            role_business_lines: [
              {
                business_line_id: 1,
                business_line_name: 'BS TEST #1',
                business_line_color: 'green',
              },
              {
                business_line_id: 3,
                business_line_name: 'BS TEST #3',
                business_line_color: 'green',
              },
            ],
            role_permissions: [
              {
                permissions_id: 8,
                permissions_name: 'ABM_APIS',
                permission_color: 'red',
              },
            ],
          },
        ],
      }
    }

    return axiosApiInstance.get(`/roles`)
  },
  listBusinessLinesForRoles: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          { business_line_id: 1, business_line_name: 'BS TEST #1' },
          { business_line_id: 2, business_line_name: 'BS TEST #2' },
          { business_line_id: 3, business_line_name: 'BS TEST #3' },
        ],
      }
    }

    return axiosApiInstance.get(`/roles/business-lines`)
  },
  listPermissionsForRoles: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          { permissions_id: 1, permissions_name: 'Permission TEST #1' },
          { permissions_id: 2, permissions_name: 'Permission TEST #2' },
          { permissions_id: 3, permissions_name: 'Permission TEST #3' },
        ],
      }
    }

    return axiosApiInstance.get(`/roles/permissions`)
  },
  createRole: async (is_mock, roleData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.post(`/roles`, { ...roleData })
  },
  deleteRole: async (is_mock, role_id) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.delete(`/roles/${role_id}`)
  },
  updateRole: async (is_mock, role_id, roleData) => {
    if (is_mock) {
      return { status: 204 }
    }

    return axiosApiInstance.put(`/roles/${role_id}`, { ...roleData })
  },
}

export default API_ROLES

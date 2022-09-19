import axiosApiInstance from './axios'

const API_USERS = {
  listRolesForUsers: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          { role_id: 1, role_name: 'BS #1' },
          { role_id: 2, role_name: 'BS #2' },
        ],
      }
    }

    const result = await axiosApiInstance.get(`/users/roles`);
    //console.log(result);
    return result;
  },
  getRealms: async () => {
    const result = await axiosApiInstance.get(`/users/getRealms`)
    //console.log(result.data);
    return result
  },
  getUsers: async (is_mock) => {
    if (is_mock) {
      return {
        data: [
          {
            user_id: 1,
            user_role_id: 1,
            user_role_name: 'user_group_1',
            user_role_color: 'red',
            user_name: 'Usuario 1 Name',
            user_email: 'usuario1@gmail.com',
            user_api_key: '1az34nxlopwba',
            user_active: true,
            user_created_at: '23/10/2022',
            user_updated_at: '01/03/2022',
          },
          {
            user_id: 2,
            user_role_id: 2,
            user_role_name: 'user_group_2',
            user_role_color: 'green',
            user_name: 'Name Usuario 2',
            user_email: 'usuario2@email.com',
            user_api_key: '44wx24442wba',
            user_active: true,
            user_created_at: '13/12/2021',
            user_updated_at: '01/03/2022',
          },
          {
            user_id: 3,
            user_role_id: 3,
            user_role_name: 'user_group_3',
            user_role_color: 'blue',
            user_name: '3 Name User',
            user_email: 'usuario3@hotmial.com',
            user_api_key: '44wx24442wba',
            user_active: false,
            user_created_at: '06/05/2023',
            user_updated_at: '01/03/2022',
          },
        ],
      }
    }

    const result = await axiosApiInstance.get(`/users`)
    //console.log(result.data);
    return result
  },
  createUser: async(is_mock, usrData) => {
    if( is_mock ) {
      return { status: 204 };
    }

    const result = await axiosApiInstance.post(
      `/users`,
      { ...usrData }
    );
    //console.log(result);
    return result;
  },
  deleteUser: async(is_mock, idCognito) => {
    if( is_mock ) {
      return { status: 204 };
    }
    
    const result = await axiosApiInstance.delete(`/users/${idCognito}`);
    //console.log(result);
    return result;
  },
  updateUser: async(is_mock, idCognito, usrData) => {
    if( is_mock ) {
      return { status: 204 };
    }
    
    const result = await axiosApiInstance.put(
      `/users/${idCognito}`,
      { ...usrData }
    );
    //console.log(result);
    return result;
  },
  confirmUser: async (username, confirmation_code) => {
    const result = await axiosApiInstance.post(`/confirm_user/${username}`, {
      confirmation_code
    });
    //console.log(result);
    return result;
  }
}

export default API_USERS

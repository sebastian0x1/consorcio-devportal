import axiosApiInstance from './axios'
import { makeHash } from '../utils/hashing'

const API_AUTH = {
  Login: async (username, password) => {
    let result = await axiosApiInstance.post(
      `/login`, {
        username: makeHash(username),
        password: makeHash(password),
      }
    )
    //console.log(result)
    return result
  },
  LoginAD: async (code) => {
    let result = await axiosApiInstance.post(
      `/loginAD`, {
        code : code,
      }
    )

    return result
  },
  forgotPassword: async (isMock, email) => {
    if (isMock) {
      console.log(email)
      return { status: 204 }
    }
    let params = {}
    params.username = makeHash(email)
    
    // delete params.email
    let result = await axiosApiInstance.post(`/forgot_password`, params)
    //console.log(result);
    return result.status === 204
  },
  resetPassword: async (isMock, params) => {
    if (isMock) {
      console.log(params)
      return { status: 204 }
    }
    
    params.password = makeHash(params.password)
    let result = await axiosApiInstance.post(`/reset_password`, params)
    return {
      status : result.status < 300,
      data: result.data
    }
  },
  changePassword: async (isMock, params) => {
    if (isMock) {
      console.log(params)
      return { status: 204 }
    }

    let result = await axiosApiInstance.post(
      `/change_password`, {
        username: makeHash(params.email),
        password: makeHash(params.password),
        newPassword: makeHash(params.new_password),
      }
    )
    //console.log(result)
    return result
  },
  refreshTokens: async (isMock, refreshToken, idCognito, isADUser) => {
    if (isMock) {
      return {
        status: 200,
        data: {
          idToken: "idToken",
          accessToken: "accessToken",
          refreshToken: "refreshToken",
          isADUser: isADUser,
        }
      }
    }

    let result = await axiosApiInstance.post('/auth/refreshTokens', {
      refresh_token_previous_login: refreshToken,
      username: idCognito,
      isADUser: isADUser
    })
    //console.log(result)
    return result
  }
}

export default API_AUTH

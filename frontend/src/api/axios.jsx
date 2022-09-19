import axios from 'axios'
import jwt_decode from "jwt-decode";
import dayjs from 'dayjs'
import { store } from '../reducers/index'
import { login, logout } from '../services/self'
import swal from 'sweetalert'

const axiosApiInstance = axios.create({
  baseURL: process.env.REACT_APP_APIURL,
  validateStatus: false,
})

let data;

store.subscribe(() => (data = store.getState()))

axiosApiInstance.interceptors.request.use( async req => {
    const urlRefreshToken = process.env.REACT_APP_APIURL.concat('/auth/refreshTokens')
    // console.log("data", data)
    const token = data?.auth.accessToken
    // console.log('token', token)
    if (token !== undefined){
        req.headers.Authorization = `Bearer ${token}`
      
      // console.log("prev")
      const user = jwt_decode(data.auth.accessToken)
      // console.log('user', user)
      // console.log('diff(dayjs()', dayjs())
      // console.log('dayjs.unix(user.exp)', dayjs.unix(user.exp))
      const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
      // console.log('isExpired', isExpired)

      if(!isExpired){
        // console.log('req', req)
        return req
      }else{
        const rs = await axios.post(urlRefreshToken, {          
          refresh_token_previous_login: data.auth.refreshToken,
          username: data.auth.idCognito,
          isADUser: data.auth.isADUser
        }).catch((error) => {
          if (error.response.status === 403) {
            swal({
              title: 'Sesión vencida. Vuelva a iniciar sesión.',
              icon: 'error',
              button: true,
          }).then(() => { logout() })
          }
        })

        // console.log('rs', rs)
        
        // Ver si esto se mantiene
        login({
          idToken: rs.data.id_token,
          accessToken: rs.data.access_token,
          refreshToken: rs.data.refresh_token
        })
        
        req.headers.Authorization = `Bearer ${rs.data.access_token}`
      }
    }
    
    return req
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosApiInstance

import React, { useEffect } from 'react'
import API from '../api/index'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/self'
import axios from 'axios'

const LoginAD = () => {
    const navigate = useNavigate()

    useEffect(() => {
        handleLoginAD()
    },)

  async function handleLoginAD() { 
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    let { data } = await API.LoginAD(code)
    
    if (data.statusCode === 201) {
      // Result data
      data = data.body

      // Lambda que enviara la info al back para comprobar que el usuario exista.
      const urlSSOValidate = process.env.REACT_APP_APIURL.concat('/users/sso_validate')
      let {data: {user_role, user_permissions }} = await axios.post(urlSSOValidate, {IDToken: data.id_token} )
      // console.log('user_role: ', user_role, 'user_permissions: ', user_permissions)

      // Save state in localStorage
      login({
        idToken: data.id_token,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        userRole : user_role,
        userPermissions: user_permissions
      })
      // Redirect
      navigate('/apis')
    } else {
      // Redirect
      navigate('/login')
    }
  }

  return (
    <>
      <div style={{ padding: '25vh', background: 'gray', height: '100vh' }}>        
        <div className="ui active inverted dimmer">
          <div className="ui large text loader">Cargando...</div> 
        </div> 
      </div>
    </>
  )
}
export default LoginAD
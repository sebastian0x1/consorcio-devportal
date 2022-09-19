import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Grid, Segment, Loader } from 'semantic-ui-react'
import swal from 'sweetalert'
import API from '../api/index'
import { login } from '../services/self'

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
const DOMAIN_NAME = process.env.REACT_APP_DOMAIN_NAME
const REGION = process.env.REACT_APP_REGION
const REDIRECT_URL = process.env.REACT_APP_REDIRECT_URL

const DEFAULT_CREDENTIALS = {
  email: '',
  password: '',
}

export default function Login() {

  const [data, setData] = useState(DEFAULT_CREDENTIALS)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }

  async function handleFormLogin() { 
    // Loading
    setIsLoading(true)

    // Check auth
    let result = await API.Login(data.email, data.password)
    //console.log(result.data)
    if (result.status === 201) {
      // Result data
      result = result.data
      //console.log(result)

      // Save state in localStorage
      login({
        idToken: result.id_token,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      })

      // Redirect
      navigate('/apis')
    } else {
      // Loading
      setIsLoading(false)

      // Reset password
      setData({
        ...data,
        password: '',
      })

      // Show error msg
      swal({
        title: result && result?.data ? result.data : 'Error al loguearse',
        text: 'Intente nuevamente.',
        icon: 'error',
      })
    }
  }

  const handleLoginAD = () => {
    // Loading
    setIsLoading(true)

    let urlLoginAD= 'https://'+ DOMAIN_NAME +
        '.auth.'+ REGION +
        '.amazoncognito.com' +
        '/oauth2/authorize?identity_provider=AzureAD&redirect_uri=' + REDIRECT_URL +
        '/loginAD&response_type=CODE&client_id=' + CLIENT_ID +
        '&scope=email openid phone'
        
    window.location.replace(urlLoginAD);
  }

  return (
    <>
      <div style={{ padding: '25vh', background: 'gray', height: '100vh' }}>
        <Grid textAlign="center" verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Form size="large" onSubmit={handleFormLogin}>
              <Segment textAlign="left">
                <h3 style={{ textAlign: 'center' }}>Iniciar sesión</h3>
                <Form.Input
                  fluid
                  name="email"
                  label="Correo electrónico"
                  labelPosition="left"
                  icon="user"
                  iconPosition="left"
                  value={data.email}
                  onChange={handleInputChange}
                  placeholder="name@host.com"
                />
                <Form.Input
                  fluid
                  name="password"
                  label="Contraseña"
                  icon="lock"
                  iconPosition="left"
                  type="password"
                  value={data.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                />
                <a href="/recoverypassword">¿Olvidaste tu contraseña?</a>
                <br />
                <br />
                {isLoading ? (
                  <Loader active content="Cargando..." size="massive" />
                ) : (
                  <>
                    <Button fluid disabled={isLoading} type="submit" color="teal" size="small">
                      Iniciar sesión
                    </Button>
                    <div className="ui horizontal divider">
                      O
                    </div>
                    <Button fluid disabled={isLoading} 
                            onClick={handleLoginAD}                          
                            color="teal" 
                            size="small">
                            Iniciar sesión con SSO
                    </Button>
                  </>
                )}
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    </>
  )
}

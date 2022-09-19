import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Form, Grid, Segment, Loader } from 'semantic-ui-react'
import swal from 'sweetalert'

import API from '../api/index'
import { logout } from '../services/self'


export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const { email } = useParams()

  const validations = () => {
    if(!password || !new_password) {
      swal({
        title: 'Los campos "Contraseña Actual" y "Nueva Contraseña" se encuentran vacíos.',
        text: 'Debe completar todos los campos.',
        icon: 'error',
      });
      return false
    } else if (password === new_password) {
      swal({
        title: 'La "Contraseña Actual" y "Nueva Contraseña" deben ser distintas.',
        text: 'Complete los campos nuevamente.',
        icon: 'error',
      });
      return false
    }

    return true
  }

  async function handleChangePassword() {
    // Loading
    setIsLoading(true);

    if(!validations()) {
        setIsLoading(false)
        return
    }

    // Check auth
    let result = await API.changePassword(false,{email,password,new_password})
    //console.log(result.data)
    if (result.status === 204) {
      swal({
        title: 'Contraseña cambiada con éxito',
        text: 'Debe ingresar nuevamente al Portal.',
        icon: 'success',
      });
      logout()
    } else {
      // Loading
      setIsLoading(false);
      swal({
        title: (result && result?.data) ? result.data : 'Error al cambiar la contraseña',
        text: 'Intente nuevamente.',
        icon: 'error',
      });
    }
  }

  return (
    <>
      <div style={{ padding: '10vh', background: 'white', height: '100vh' }}>
        <Grid textAlign="center" verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Form size="large" onSubmit={handleChangePassword}>
              <Segment textAlign="left" >
                <h3 style={{ textAlign: 'center' }}>Cambiar Contraseña</h3>
                <Form.Input
                  fluid
                  name="email"
                  label="Email"
                  labelPosition="left"
                  icon="user"
                  iconPosition="left"
                  value={email}
                  disabled
                  placeholder="name@host.com"
                />
                <Form.Input
                  fluid
                  required
                  name="password"
                  label="Contraseña Actual"
                  icon="lock"
                  iconPosition="left"
                  type="password"
                  value={password}
                  onChange={(e, { value })=> setPassword(value.trim())}
                  placeholder="Contraseña Actual"
                />
                <Form.Input
                  fluid
                  required
                  name="new_password"
                  label="Contraseña Nueva"
                  icon="lock"
                  iconPosition="left"
                  type="password"
                  value={new_password}
                  onChange={(e, { value })=> setNewPassword(value.trim())}
                  placeholder="Contraseña Nueva"
                />

                {
                  isLoading ?
                    <Loader active content="Cargando..." size="massive" />
                  :
                    <Button
                      fluid
                      disabled={isLoading}
                      type='submit'
                      color="teal"
                      size="large"
                    >
                      Enviar
                    </Button>
                }
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    </>
  )
}

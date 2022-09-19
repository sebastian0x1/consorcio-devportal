import React, { useEffect, useState } from 'react';
import { Button, Container, Form, Grid, Header, Segment, Icon, Loader } from 'semantic-ui-react';

import { makeHash } from '../../../utils/hashing';
import API from '../../../api/index';


const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  password: '',
  role_id: '',
  active: false,
}


export default function Users({
  user,
  isADUser,
  headerPageIcon,
  sendUser,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setErrors({});
    getUsersList();
    if( user !== null ) {
      setFormData({
        ...formData,
        name: user.user_name,
        email: user.user_email,
        role_id: user.user_role_id,
        active: user.user_active,
      })
    }
  }, [user])

  const getUsersList = async () => {
    // Loading
    setIsLoading(true)

    // Get user list
    let result = await API.listRolesForUsers(false)
    //console.log(result)

    if (result.data.length > 0) {
      let rolesGroup = result.data.map((item) => {
        return { value: item.role_id, text: item.role_name }
      })

      setRolesOptions(rolesGroup);
    }

    // Loading
    setIsLoading(false)
  }

  const makeValidations = () => {
    function removeError(key) {
      let newErrors = errors
      if (newErrors[key]) delete newErrors[key]
      setErrors(newErrors)
    }
    /*
    Hay que chequear que:
    - 2 < name < 50 (str)
    - 2 < email < 50 (str)
    - 2 < password < 50 (str)
    - Tenga un Rol (str)
    */
    if(formData.name.length < 2 || formData.name.length > 100) {
      setErrors({
        ...errors,
        name: {
          content: 'El nombre debe tener entre 2 y 100 caracteres.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('name')
    }

    if(formData.email.length < 2 || formData.email.length > 100) {
      setErrors({
        ...errors,
        email: {
          content: 'El email debe tener entre 2 y 100 caracteres.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('email')
    }

    if( user === null ) {
      if(formData.password.length < 5 || formData.password.length > 50) {
        setErrors({
          ...errors,
          password: {
            content: "La contraseña debe tener entre 5 y 50 caracteres.",
            pointing: 'below',
          }
        })

        return false;
      } else {
        removeError("password");
      }
    }

/*
    if(!formData.role_id) {
      setErrors({
        ...errors,
        role: {
          content: 'Debe seleccionar un Rol.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('role')
    }
*/

    return true
  }

  const sendData = async () => {
      // Invalido, no envia nada
      if (!makeValidations()) {
        console.error("validaciones", errors)
        return
      }

      if (user !== null) {
        // Update
        await sendUser({
          user_name: formData.name,
          user_role_id: formData.role_id || 0,
          user_active: Number(formData.active),
        }, user.user_id_cognito);
      } else {
        // Insert
        await sendUser({
          user_name: makeHash(formData.name),
          user_email: makeHash(formData.email),
          user_password: makeHash(formData.password),
          user_role_id: formData.role_id || 0,
        });
      }
  }

  return (
    <Container>
      <Header as="h1">
        <Icon circular inverted name={headerPageIcon} />
        {user !== null ? 'Modificar' : 'Crear'} Usuario
      </Header>
      {isLoading ? (
        <Loader active content="Cargando..." size="massive" />
      ) : (
        <Grid>
          <Grid.Column>
            <Form size="small">
              <Segment raised>
                  <Form.Input
                    fluid
                    required
                    disabled={ user?.user_id_cognito.includes('AzureAD') }
                    label='Nombre'
                    placeholder='Nombre...'
                    name='user_name'
                    value={formData.name}
                    onChange={(e, {value}) => setFormData({ ...formData, name: value })}
                    error={errors.name && errors.name.content}
                  />
                
                <Form.Input
                  fluid
                  required
                  disabled={user !== null || user?.user_id_cognito?.includes('AzureAD')}
                  label='E-Mail'
                  placeholder='E-Mail...'
                  name='user_email'
                  value={formData.email}
                  onChange={(e, {value}) => setFormData({ ...formData, email: value })}
                  error={errors.email && errors.email.content}
                />
                {user === null &&
                  <Form.Input
                    fluid
                    required
                    type='password'
                    label='Contraseña'
                    placeholder='Contraseña...'
                    name='user_password'
                    value={formData.password}
                    onChange={(e, {value}) => setFormData({ ...formData, password: value })}
                    error={errors.password && errors.password.content}
                  />
                }
                <Form.Dropdown
                  fluid
                  selection
                  label='Rol'
                  placeholder='Rol...'
                  name='user_role'
                  options={rolesOptions}
                  value={formData.role_id}
                  onChange={(e, {value}) => setFormData({ ...formData, role_id: value })}
                  error={errors.role && errors.role.content}
                />
                {user !== null && (
                  <Form.Checkbox
                    fluid
                    toggle
                    label='Usuario Activo'
                    name='user_active'
                    checked={formData.active}
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                  />
                )}
                <Button color="teal" fluid size="large" onClick={() => sendData()}>
                  {user !== null ? 'Guardar' : 'Crear'}
                </Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      )}
    </Container>
  )
}

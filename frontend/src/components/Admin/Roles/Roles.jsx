import React, { useEffect, useState } from 'react'
import { Button, Container, Form, Grid, Header, Segment, Icon, Loader } from 'semantic-ui-react'

import { COLOR_LIST, COLOR_LIST_SELECT, COLOR_LIST_SELECT_ENG } from '../Consts'
import API from '../../../api/index'

export default function Roles({ role, headerPageIcon, sendRole }) {
  const [id, setId] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [bsOptions, setBsOptions] = useState([])
  const [bsSelected, setBsSelected] = useState([])
  const [permissionsOptions, setPermissionsOptions] = useState([])
  const [permissionsSelected, setPermissionsSelected] = useState([])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setErrors({})
    getRoleDataList()
    if (role !== null) {
      setId(role.role_id)
      setName(role.role_name)
      setDescription(role.role_description)
      setColor(COLOR_LIST.indexOf(role.role_color))
      setBsSelected(role.role_business_lines.map((r) => r.business_line_id))
      setPermissionsSelected(role.role_permissions.map((r) => r.permission_id))
    } else {
      setId(null)
      setName('')
      setDescription('')
      setColor(COLOR_LIST_SELECT[0].value)
    }
  }, [role])

  const getRoleDataList = async () => {
    // Loading
    setIsLoading(true)

    // Get business lines
    let result = await API.listBusinessLinesForRoles(false)

    if (result.data.length > 0) {
      let bsGroup = result.data.map((item) => {
        return { value: item.business_line_id, text: item.business_line_name }
      })

      setBsOptions(bsGroup)
    }

    // Get permissions
    result = await API.listPermissionsForRoles(false)

    if (result.data.length > 0) {
      let permissionsGroup = result.data.map((item) => {
        return { value: item.permission_id, text: item.permission_name }
      })

      setPermissionsOptions(permissionsGroup)
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
    - Tenga minimo 1 linea de negocio (array)
    - Tenga color (str)
    */
    if (name.length < 2 || name.length > 50) {
      // console.log('name.length', name.length)
      setErrors({
        ...errors,
        name: {
          content: 'El nombre debe tener entre 2 y 50 caracteres.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('name')
    }

    if (!bsSelected.length) {
      setErrors({
        ...errors,
        business_line: {
          content: 'Debe seleccionar como mínimo una Línea de Negocio.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('business_line')
    }

    if (color < 0 || color > COLOR_LIST.length) {
      setErrors({
        ...errors,
        color: {
          content: 'Debe seleccionar un color.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('color')
    }

    return true
  }

  const sendData = async () => {
    // Invalido, no envia nada.
    if (!makeValidations()) return

    // Insert and Update have the same parameters, so we use the same function
    // When we update we pass the bs_id
    await sendRole(
      {
        role_name: name,
        role_description: description,
        role_business_lines: bsSelected,
        role_permissions: permissionsSelected,
        role_color: COLOR_LIST_SELECT_ENG[color].text,
      },
      role !== null ? id : undefined
    )
  }

  return (
    <Container>
      <Header as="h1">
        <Icon circular inverted name={headerPageIcon} />
        {role !== null ? 'Modificar' : 'Crear'} Rol
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
                  label="Nombre"
                  placeholder="Nombre..."
                  name="role_name"
                  value={name}
                  onChange={(e, { value }) => setName(value)}
                  error={errors.name && errors.name.content}
                />
                <Form.Input
                  fluid
                  label="Descripción"
                  placeholder="Descripción..."
                  name="role_description"
                  value={description}
                  onChange={(e, { value }) => setDescription(value)}
                />
                <Form.Dropdown
                  fluid
                  selection
                  multiple
                  required
                  label="Línea de Negocio"
                  placeholder="Línea de Negocio..."
                  name="role_business_line"
                  options={bsOptions}
                  value={bsSelected}
                  onChange={(e, { value }) => setBsSelected(value)}
                  error={errors.business_line && errors.business_line.content}
                />
                <Form.Dropdown
                  fluid
                  selection
                  multiple
                  label="Permisos"
                  placeholder="Permisos..."
                  name="role_permissions"
                  options={permissionsOptions}
                  value={permissionsSelected}
                  onChange={(e, { value }) => setPermissionsSelected(value)}
                />
                <Form.Dropdown
                  fluid
                  selection
                  required
                  label="Color"
                  placeholder="Color..."
                  name="role_color"
                  options={COLOR_LIST_SELECT}
                  value={color}
                  onChange={(e, { value }) => setColor(value)}
                  error={errors.color && errors.color.content}
                />
                <Button color="teal" fluid size="large" onClick={() => sendData()}>
                  {role !== null ? 'Guardar' : 'Crear'}
                </Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      )}
    </Container>
  )
}

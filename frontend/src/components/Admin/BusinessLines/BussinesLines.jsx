import React, { useEffect, useState } from 'react'
import { Button, Container, Form, Grid, Header, Segment, Icon, Loader } from 'semantic-ui-react'

import { COLOR_LIST, COLOR_LIST_SELECT, COLOR_LIST_SELECT_ENG } from '../Consts'
import API from '../../../api/index'

export default function BussinesLines({ bs, headerPageIcon, sendBs }) {
  const [first, setFirst] = useState(true)
  const [id, setId] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [tagAccountSelected, setTagAccountSelected] = useState([])
  const [tagAccountOptions, setTagAccountOptions] = useState([])
  const [apisOptionsSelect, setApisOptionsSelect] = useState([])
  const [apisOptions, setApisOptions] = useState([])
  const [apisSelected, setApisSelected] = useState([])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setErrors({})
    getAllLists()
    if (bs !== null) {
      setId(bs.business_line_id)
      setName(bs.business_line_name)
      setColor(COLOR_LIST.indexOf(bs.business_line_color))
      setTagAccountSelected(bs.business_line_tag_accounts.map((api) => api.tag_account_id))
      setApisSelected(bs.business_line_apis.map((api) => api.api_id + '-' + api.api_stage))
    } else {
      setId(null)
      setName('')
      setColor(COLOR_LIST_SELECT[0].value)
      setTagAccountSelected([])
      setApisSelected([])
    }
  }, [bs])

  useEffect(() => {
    if (apisOptions.length < 1 || tagAccountSelected.length < 1) return

    let newApisOptions = apisOptions.filter((api) => {
      if (tagAccountSelected.includes(api.tag_id)) return api
    })

    // Set new options
    setApisOptionsSelect(newApisOptions)

    if (first) {
      setFirst(false)
      return
    }

    setApisSelected([])
  }, [tagAccountSelected])

  const getAllLists = async () => {
    // Loading
    setIsLoading(true)

    // Get Tags
    let result = await API.listTagsForBusinessLine(false)

    if (result.data.length > 0) {
      let tagGroup = result.data.map((item) => {
        return { value: item.tag_account_id, text: `${item.tag_account} - ${item.tag_name}` }
      })

      setTagAccountOptions(tagGroup)
    }

    // Get APIs
    result = await API.listAPIsForBusinessLine(false)

    if (result.data.length > 0) {
      let apisGroup = result.data.map((item) => {
        return {
          value: item.api_id + '-' + item.api_stage,
          text: `${item.api_name} (${item.api_stage})`,
          tag_id: item.tag_account_id,
        }
      })

      setApisOptions(apisGroup)
      setApisOptionsSelect(apisGroup)
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
    - Tenga minimo 1 API (array)
    - Tenga color (str)
    */
    if (name.length < 2 || name.length > 50) {
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

    if (!tagAccountSelected.length) {
      setErrors({
        ...errors,
        tags: {
          content: 'Debe seleccionar uno como mínimo.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('tags')
    }

    if (!apisSelected.length) {
      setErrors({
        ...errors,
        apis: {
          content: 'Debe seleccionar como mínimo una API.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('apis')
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
    // Invalido, no envia nada
    if (!makeValidations()) return

    //Remove stage name from api_id value
    let selectedApis = apisSelected.map((api) => {
      let api_id = api.split('-')
      return api_id[0]
    })

    // Insert and Update have the same parameters, so we use the same function
    // When we update we pass the bs_id
    await sendBs(
      {
        business_line_name: name,
        business_line_apis_tag_accounts: tagAccountSelected,
        business_line_apis: selectedApis,
        business_line_color: COLOR_LIST_SELECT_ENG[color].text,
      },
      bs !== null ? id : undefined
    )
  }

  return (
    <Container style={{ padding: '50px' }}>
      <Header as="h1">
        <Icon circular inverted name={headerPageIcon} />
        {bs !== null ? 'Modificar' : 'Crear'} Línea de Negocio
      </Header>
      <br />
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
                  icon="list"
                  iconPosition="left"
                  label="Nombre"
                  placeholder="Nombre..."
                  name="business_line_name"
                  value={name}
                  onChange={(e, { value }) => setName(value)}
                  error={errors.name && errors.name.content}
                />
                <Form.Dropdown
                  fluid
                  multiple
                  search
                  selection
                  required
                  label="Cuenta - Ambiente"
                  placeholder="Cuenta - Ambiente..."
                  name="business_line_apis_tag_accounts"
                  options={tagAccountOptions}
                  value={tagAccountSelected}
                  onChange={(e, { value }) => setTagAccountSelected(value)}
                  error={errors.tags && errors.tags.content}
                />
                {tagAccountSelected.length > 0 && (
                  <Form.Dropdown
                    fluid
                    selection
                    search
                    multiple
                    required
                    label="APIs"
                    placeholder="API..."
                    name="business_line_apis"
                    options={apisOptionsSelect}
                    value={apisSelected}
                    onChange={(e, { value }) => setApisSelected(value)}
                    error={errors.apis && errors.apis.content}
                  />
                )}
                <Form.Dropdown
                  fluid
                  selection
                  required
                  label="Color"
                  placeholder="Color..."
                  name="business_line_color"
                  options={COLOR_LIST_SELECT}
                  value={color}
                  onChange={(e, { value }) => setColor(value)}
                  error={errors.color && errors.color.content}
                />
                <br />
                <Button color="teal" fluid size="large" onClick={() => sendData()}>
                  {bs !== null ? 'Guardar' : 'Crear'}
                </Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      )}
    </Container>
  )
}

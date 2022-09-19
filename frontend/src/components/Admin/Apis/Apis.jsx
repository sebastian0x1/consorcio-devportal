import React, { useEffect, useState } from 'react'
import { Button, Container, Form, Grid, Header, Segment, Icon, Loader } from 'semantic-ui-react'

import { COLOR_LIST, COLOR_LIST_SELECT, COLOR_LIST_SELECT_ENG } from '../Consts'
import API from '../../../api/index'

const FILE_5MB_SIZE = 5242880

export default function Apis({ api, headerPageIcon, sendApi }) {
  const [id, setId] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [tagAccountSelected, setTagAccountSelected] = useState('')
  const [tagAccountOptions, setTagAccountOptions] = useState([])
  const [stageOptions, setStageOptions] = useState('')
  const [stage, setStage] = useState('')
  const [fileType, setFileType] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [errors, setErrors] = useState({})
  const [isExternal, setIsExternal] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setErrors({})
    getAllData()
    if (api !== null) {
      setId(api.api_id)
      setName(api.api_name)
      setColor(COLOR_LIST.indexOf(api.api_color))
      setTagAccountSelected(api.api_tag_account_id)
      setStage(api.api_stage_id)
      setIsExternal(api.api_is_external)
    } else {
      setId(null)
      setName('')
      setTagAccountSelected('')
      setStage('')
      setFileType('')
      setIsExternal(1)
      setColor(COLOR_LIST_SELECT[0].value)
    }
  }, [api])

  const getAllData = async () => {
    // Loading
    setIsLoading(true)

    // Get Tags
    let result = await API.listTagsForBusinessLine(false)

    result.data=result.data.filter((item) => {return item.tag_account === 'external'})
    
    if (result.data.length > 0) {
      let tagGroup = result.data.map((item) => {
        return { value: item.tag_account_id, text: item.tag_name }
      })

      setTagAccountOptions(tagGroup)
    }

    // Get Stages
    result = await API.getStages(false)

    if (result.data.length > 0) {
      let apisGroup = result.data.map((item) => {
        return { value: item.stage_id, text: item.stage_name }
      })

      setStageOptions(apisGroup)
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
    - Tenga color (str)
    - Tenga stage (str)
    - Archivo del swagger (str)
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

    if (!tagAccountSelected && isExternal) {
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

    if (!stage) {
      setErrors({
        ...errors,
        stage: {
          content: 'Debe seleccionar un Versión.',
          pointing: 'below',
        },
      })

      return false
    } else {
      removeError('stage')
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

    if (api === null) {
      if (!fileName) {
        setErrors({
          ...errors,
          file: {
            content: 'Debe seleccionar un archivo para la API.',
            pointing: 'below',
          },
        })

        return false
      } else {
        removeError('file')
      }
    }

    return true
  }

  const sendData = async () => {
    let stage_name = ''
   stageOptions.map((op)=>{
      if(op.value === stage){
         stage_name = op.text
      }
    })
    // return
    // Invalido, no envia nada
    
    if (!makeValidations()) return

    if (api !== null) {
      // Update
      const nombreupd = tagAccountOptions.find((e) => e.value === tagAccountSelected).text
      await sendApi(
        {
          api_name: name,
          api_stage_id: stage,
          api_stage: stage_name,
          api_color: COLOR_LIST_SELECT_ENG[color].text,
          api_tag_account_id: isExternal === 1 ? tagAccountSelected : api.api_tag_account_id,
          api_tag_account_name: isExternal === 1 ? nombreupd : api.api_tag_account_name,
          last_path: api.api_tag_account_name+'/'+api.api_stage+'/swagger.json'
        },
        id
      )
    } else {
      // Insert

      const nombre = tagAccountOptions.find((e) => e.value === tagAccountSelected).text
      await sendApi({
        api_name: name,
        api_stage_id: stage,
        api_color: COLOR_LIST_SELECT_ENG[color].text,
        api_tag_account_id: tagAccountSelected,
        api_tag_account_name: nombre,

        api_file: {
          content: fileContent,
          type: fileType,
        },
      })
    }
  }

  const fileChange = (event) => {
    let uploadFile = event.target.files[0]

    if (uploadFile.size > FILE_5MB_SIZE) {
      alert('El archivo supera los 5mb')
    } else {
      const reader = new FileReader()
      reader.onload = handleFileLoad
      reader.readAsText(event.target.files[0])

      let fileName = uploadFile.name
      let fileType = fileName.split('.').pop()

      setFileType(fileType)
      setFileName(fileName)
    }
  }

  function handleFileLoad(event) {
    let content = event.target.result
    setFileContent(content)
  }

  return (
    <Container>
      <Header as="h1">
        <Icon circular inverted name={headerPageIcon} />
        {api !== null ? 'Modificar' : 'Crear'} API
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
                  label="Nombre"
                  placeholder="Nombre..."
                  name="api_name"
                  value={name}
                  onChange={(e, { value }) => setName(value)}
                  error={errors.name && errors.name.content}
                />

                {isExternal === 1 && (
                  <Form.Dropdown
                    fluid
                    selection
                    search
                    required
                    label="Ambiente"
                    placeholder="Ambiente..."
                    name="api_tag_accounts"
                    options={tagAccountOptions}
                    value={tagAccountSelected}
                    onChange={(e, { value }) => setTagAccountSelected(value)}
                    error={errors.tags && errors.tags.content}
                  />
                )}
                <Form.Dropdown
                  fluid
                  selection
                  required
                  label="Versión"
                  placeholder="Versión..."
                  name="api_stage"
                  options={stageOptions}
                  value={stage}
                  disabled={api !== null && isExternal !== 1}
                  onChange={(e, { value }) => setStage(value)}
                  error={errors.stage && errors.stage.content}
                />
                <Form.Dropdown
                  fluid
                  selection
                  required
                  label="Color"
                  placeholder="Color..."
                  name="api_color"
                  options={COLOR_LIST_SELECT}
                  value={color}
                  onChange={(e, { value }) => setColor(value)}
                  error={errors.color && errors.color.content}
                />
                {!api && (
                  <>
                    <Form.Field required error={errors.file && errors.file.content}>
                      <label>Cargar archivo</label>
                      <Button
                        className="ui basic button"
                        content={fileName && fileName ? fileName : 'Seleccionar archivo'}
                        as="label"
                        htmlFor="upload_file"
                        type="button"
                        icon="file"
                      />
                      <input
                        type="file"
                        id="upload_file"
                        accept="file/*,.json,.yml,.yaml"
                        hidden
                        onChange={(e) => fileChange(e)}
                      />
                    </Form.Field>
                  </>
                )}
                <br />
                <Button fluid color="teal" size="large" onClick={() => sendData()}>
                  {api !== null ? 'Guardar' : 'Crear'}
                </Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      )}
    </Container>
  )
}

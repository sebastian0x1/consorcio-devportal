import React, { useEffect, useState } from 'react'
import { Icon, Label, Modal, Loader, Button } from 'semantic-ui-react'
import swal from 'sweetalert'
import { v4 as uuidv4 } from 'uuid'
import { Typography } from '@material-ui/core'
import { traduccionColores } from '../Consts'
import { utcToChile } from '../../../utils/time'
import API from '../../../api/index'
import TableTemplate from '../TableTemplate'
import Apis from './Apis'
import { connect } from 'react-redux'

function AbmApis({ apiIcon = 'sitemap', refreshToken, idCognito }) {
  const [apiData, setApisData] = useState([])
  const [modalContent, setModelContent] = useState({ type: null, data: null })
  const [newChange, setNewChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  let isMock = false

  // Load Data
  useEffect(() => getApis(), [newChange])

  const getApis = async () => {
    // Loading
    setIsLoading(true)

    // New Changes
    setNewChange(false)

    // Get APIs
    let result = await API.getAPIS(isMock)
    //console.log(result)
    setApisData(result.data || [])

    // Loading
    setIsLoading(false)
  }

  // Modal
  const openModalForModify = (type, data) => {
    setModelContent({ type, data })
    setOpenModal(true)
  }

  const closeModal = () => {
    setModelContent({ type: null, data: null })
    setOpenModal(false)
  }

  // Page buttons
  const deleteButton = {
    type: 'delete',
    tooltip: 'Eliminar',
    action: (api) => {
      // console.log('DELETE', api)
      if (api.api_is_external) deleteApi(api)
    },
  }

  const editButton = {
    type: 'update',
    tooltip: 'Editar',
    // eslint-disable-next-line no-loop-func
    action: (api) => {
      // console.log('EDIT', api)
      openModalForModify('edit', api)
    },
  }

  const addButton = () => {
    // console.log('addButton')
    openModalForModify('add', null)
  }

  // Send request to insert/update/delete
  const sendApi = async (params, api_id = undefined) => {
    // Close Modal
    setOpenModal(false)

    // console.log('DATOS DE TOKEN en sendApi')
    // console.log('refreshToken', refreshToken)
    // console.log('idCognito', idCognito)
    if (refreshToken) {
      // New request to get new token
      let result = await API.refreshTokens(isMock, refreshToken, idCognito)
      // console.log('result.refreshTokens', result)
    }

    // Set Loading
    setIsLoading(true)

    // Check operation
    if (modalContent.data !== null) {
      // Update
      let result = await API.updateAPI(isMock, api_id, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'API actualizada correctamente!',
          icon: 'success',
          button: true,
        })
      } else if (result.status === 409) {
        swal({
          title: 'Error al actualizar la API!',
          text: 'El nombre de la api existe en este ambiente para esta versión.',
          icon: 'error',
          button: true,
        })
      } else {
        swal({
          title: 'Error al actualizar la API!',
          text: 'Intente nuevamente.',
          icon: 'error',
          button: true,
        })
      }
    } else {
      // Insert
      let result = await API.createAPI(isMock, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'API creada correctamente!',
          icon: 'success',
          button: true,
        })
      } else if (result.status === 409) {
        swal({
          title: 'Error al crear la API!',
          text: 'El nombre de la api existe en este ambiente para esta versión.',
          icon: 'error',
          button: true,
        })
      } else {
        swal({
          title: 'Error al crear la API!',
          text: 'Intente nuevamente.',
          icon: 'error',
          button: true,
        })
      }
    }

    // Reset Content
    setModelContent({ type: null, data: null })

    // Loading
    setIsLoading(false)
  }

  const deleteApi = async ({ api_id, api_name, api_stage }) => {
    // Wait for value
    let value = await swal({
      title: `Desea borrar la API: ${api_name} (${api_stage}) ?`,
      text: 'Una vez eliminada, no se podrá recuperar.',
      icon: 'warning',
      buttons: ['Cancelar', true],
      dangerMode: true,
    })

    if (value === null) return

    // Call deletion API
    let result = await API.deleteAPI(isMock, api_id)
    // console.log('API.deleteAPI =>', result)

    // Notify if it was deleted ok
    if (result.status === 204) {
      // Notify there was a change
      setNewChange(true)

      // Show alert
      swal({
        title: 'API eliminada correctamente!',
        icon: 'success',
        button: true,
      })
    } else {
      swal({
        title: 'Error al eliminar la API!',
        text: 'Intente nuevamente.',
        icon: 'error',
        button: true,
      })
    }
  }

  // Table Content
  const tableColumns = () => {
    return [
      {
        name: 'api_id',
        label: 'ID',
        options: {
          display: false,
          filter: true,
          sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                {value}
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_name',
        label: 'Nombre',
        options: {
          display: true,
          filter: true,
          sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                {value}
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_color',
        label: 'Color',
        options: {
          display: true,
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                <Label key={uuidv4()} color={value}>
                  {traduccionColores(value)}
                </Label>
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_stage',
        label: 'Versión',
        options: {
          display: true,
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            let stage_color = apiData[tableMeta.rowIndex].api_stage_color
            return (
              <Typography component={'span'} noWrap={false}>
                <Label key={uuidv4()} color={stage_color}>
                  {value}
                </Label>
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_tag_account_name',
        label: 'Ambiente',
        options: {
          display: true,
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            let tag_account_color = apiData[tableMeta.rowIndex].api_tag_account_color
            return (
              <Typography component={'span'} noWrap={false}>
                <Label key={uuidv4()} color={tag_account_color}>
                  {value}
                </Label>
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_is_external',
        label: 'Externa',
        options: {
          display: true,
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                {value ? (
                  <Label key={uuidv4()} color={'orange'}>
                    SI
                  </Label>
                ) : (
                  <Label key={uuidv4()} color={'grey'}>
                    NO
                  </Label>
                )}
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_created_at',
        label: 'Creado',
        options: {
          display: true,
          filter: true,
          sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                {value}
              </Typography>
            )
          },
        },
      },
      {
        name: 'api_updated_at',
        label: 'Última Modificación',
        options: {
          display: false,
          filter: true,
          sort: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                {value}
              </Typography>
            )
          },
        },
      },
    ]
  }

  const tableContent = () => {
    if (!apiData.length) return []

    return apiData.map((api) => {
      api.api_created_at = utcToChile(api.api_created_at)
      api.api_updated_at = api.api_updated_at ? utcToChile(api.api_updated_at) : '-'
      return api
    })
  }

  // Loading
  if (isLoading) return <Loader active content="Cargando..." size="massive" />

  // Open modal
  if (modalContent.type) {
    return (
      <Modal dimmer="blurring" onClose={() => closeModal()} onOpen={() => setOpenModal(true)} open={openModal} size="small">
        <Modal.Content>
          <Apis api={modalContent.data} headerPageIcon={apiIcon} sendApi={sendApi} />
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" onClick={() => closeModal()}>
            <Icon name="remove" />
            Cerrar
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  // Table
  return (
    <TableTemplate
      titleIcon={<Icon circular inverted name={apiIcon} size="small" />}
      title="APIs"
      columns={tableColumns()}
      data={tableContent()}
      buttons={[editButton, deleteButton]}
      showCreateButton={true}
      createButtonAction={addButton}
      createButtonTooltip="Agregar API"
    />
  )
}

function mapState(state) {
  // console.log('state de apis', state)
  return {
    ApiIcon: 'address card outline',
    refreshToken: state.auth.refreshToken,
    idCognito: state.auth.idCognito,
    idRole: state.auth.idRole,
    userPermissions: state.auth.userPermissions,
  }
}

const AbmApisWrapped = connect(mapState, null)(AbmApis)

export default AbmApisWrapped

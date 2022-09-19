import React, { useEffect, useState } from 'react'
import { Icon, Label, Modal, Loader, Button, List } from 'semantic-ui-react'
import swal from 'sweetalert'
import { v4 as uuidv4 } from 'uuid'
import { Typography } from '@material-ui/core'

import { utcToChile } from '../../../utils/time'
import API from '../../../api/index'
import TableTemplate from '../TableTemplate'
import BussinesLines from './BussinesLines'
import { traduccionColores } from '../Consts'

export default function AbmBusinessLines({ bsIcon = 'briefcase' }) {
  const [bsData, setBsData] = useState([])
  const [modalContent, setModelContent] = useState({ type: null, data: null })
  const [newChange, setNewChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  let isMock = false

  // Load Data
  useEffect(() => getBusinessLines(), [newChange])

  const getBusinessLines = async () => {
    // Loading
    setIsLoading(true)

    // New Changes
    setNewChange(false)

    // Get BS
    let result = await API.listBusinessLines(isMock)
    setBsData(result.data || [])

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
    action: (bs) => {
      //console.log('DELETE', bs)
      deleteBs(bs)
    },
  }

  const editButton = {
    type: 'update',
    tooltip: 'Editar',
    // eslint-disable-next-line no-loop-func
    action: (bs) => {
      //console.log('EDIT', bs)
      openModalForModify('edit', bs)
    },
  }

  const addButton = () => {
    // console.log('addButton')
    openModalForModify('add', null)
  }

  // Send request to insert/update/delete
  const sendBs = async (params, bs_id = undefined) => {
    // Close Modal
    setOpenModal(false)

    // Set Loading
    setIsLoading(true)

    // Check operation
    if (modalContent.data !== null) {
      // Update
      let result = await API.updateBusinessLines(isMock, bs_id, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'Línea de Negocio actualizada correctamente!',
          icon: 'success',
          button: true,
        })
      } else {
        swal({
          title: 'Error al actualizar la Línea de Negocio!',
          text: 'Intente nuevamente.',
          icon: 'error',
          button: true,
        })
      }
    } else {
      // Insert
      let result = await API.createBusinessLines(isMock, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'Línea de Negocio creada correctamente!',
          icon: 'success',
          button: true,
        })
      } else {
        swal({
          title: 'Error al crear la Línea de Negocio!',
          text: result.data,
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

  const deleteBs = async ({ business_line_id, business_line_name }) => {
    // Wait for value
    let value = await swal({
      title: `Desea borrar la Línea de Negocio: ${business_line_name} ?`,
      text: 'Una vez eliminada, no se podrá recuperar.',
      icon: 'warning',
      buttons: ['Cancelar', true],
      dangerMode: true,
    })

    // value === null, canceled
    // value === true, ok
    if (value === null) return

    // Call deletion API
    let result = await API.deleteBusinessLines(isMock, business_line_id)

    // Notify if it was deleted ok
    if (result.status === 204) {
      // Notify there was a change
      setNewChange(true)

      // Show alert
      swal({
        title: 'Línea de Negocio eliminada correctamente!',
        icon: 'success',
        button: true,
      })
    } else {
      swal({
        title: 'Error al elminar Línea de Negocio!',
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
        name: 'business_line_id',
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
        name: 'business_line_name',
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
        name: 'business_line_color',
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
        name: 'business_line_apis',
        label: 'APIs',
        options: {
          display: true,
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <List horizontal>
                {value.map((api) => (
                  <List.Item key={uuidv4()}>
                    <Label key={uuidv4()} color={api.api_color}>
                      {api.api_name} ({api.api_stage})
                    </Label>
                  </List.Item>
                ))}
              </List>
            )
          },
        },
      },
      {
        name: 'business_line_tag_accounts',
        label: 'Cuenta - Ambiente',
        options: {
          display: true,
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <List horizontal>
                {value.map((api) => (
                  <List.Item key={uuidv4()}>
                    <Label key={uuidv4()} color={api.tag_account_color}>
                      {`${api.tag_account} - ${api.tag_account_name}`}
                    </Label>
                  </List.Item>
                ))}
              </List>
            )
          },
        },
      },
      {
        name: 'business_line_created_at',
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
        name: 'business_line_updated_at',
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
    if (!bsData.length) return []

    return bsData.map((bs) => {
      bs.business_line_created_at = utcToChile(bs.business_line_created_at)
      bs.business_line_updated_at = bs.business_line_updated_at ? utcToChile(bs.business_line_updated_at) : '-'
      return bs
    })
  }

  // Loading
  if (isLoading) return <Loader active content="Cargando..." size="massive" />

  // Open modal
  if (modalContent.type) {
    return (
      <Modal dimmer="blurring" onClose={() => closeModal()} onOpen={() => setOpenModal(true)} open={openModal} size="small">
        <Modal.Content>
          <BussinesLines bs={modalContent.data} headerPageIcon={bsIcon} sendBs={sendBs} />
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

  return (
    <TableTemplate
      titleIcon={<Icon circular inverted name={bsIcon} size="small" />}
      title="Líneas de Negocios"
      columns={tableColumns()}
      data={tableContent()}
      buttons={[editButton, deleteButton]}
      showCreateButton={true}
      createButtonAction={addButton}
      createButtonTooltip="Agregar Línea de Negocio"
    />
  )
}

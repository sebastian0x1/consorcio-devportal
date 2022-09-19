import React, { useEffect, useState } from 'react'
import { Label, Loader, Modal, Button, Icon } from 'semantic-ui-react'
import swal from 'sweetalert'
import { v4 as uuidv4 } from 'uuid'
import { Typography } from '@material-ui/core'

import { utcToChile } from '../../../utils/time'
import API from '../../../api/index'
import TableTemplate from '../TableTemplate'
import Stages from './Stages'
import { traduccionColores } from '../Consts'

export default function AbmStages({ stageIcon = 'briefcase' }) {
  const [stagesData, setStagesData] = useState([])
  const [modalContent, setModelContent] = useState(null)
  const [newChange, setNewChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  let isMock = false

  // Load Data
  useEffect(() => getStages(), [newChange])

  const getStages = async () => {
    // Loading
    setIsLoading(true)

    // New Changes
    setNewChange(false)

    // Get Stages
    let result = await API.getStages(isMock)
    //console.log(result);
    setStagesData(result.data || [])

    // Loading
    setIsLoading(false)
  }

  // Modal
  const openModalForModify = (data) => {
    setOpenModal(true)
    setModelContent(data)
  }

  const closeModal = () => {
    setModelContent(null)
    setOpenModal(false)
  }

  const editButton = {
    type: 'update',
    tooltip: 'Editar',
    // eslint-disable-next-line no-loop-func
    action: (stage) => {
      //console.log('EDIT', stage)
      openModalForModify(stage)
    },
  }

  const addButton = () => {
    /* */
  }

  // Send request to insert/update
  const sendStage = async (params, stage_id) => {
    //console.log('sendStage.params', params)
    //console.log('sendStage.stage_id', stage_id)

    if (modalContent === null) {
      // console.log('Not sent because its null')
      return
    }

    // Update
    let result = await API.updateStage(isMock, stage_id, params)
    //console.log('API.updateStage =>', result)

    if (result.status === 204) {
      // Notify there was a change
      setNewChange(true)

      // Show alert
      swal({
        title: 'Versión actualizada correctamente!',
        icon: 'success',
        button: true,
      })
    } else {
      swal({
        title: 'Error al actualizar Versión!',
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
        name: 'stage_id',
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
        name: 'stage_name',
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
        name: 'stage_color',
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
        name: 'stage_active',
        label: 'Activo',
        options: {
          display: true,
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <Typography component={'span'} noWrap={false}>
                {value ? (
                  <Label key={uuidv4()} color={'green'}>
                    SI
                  </Label>
                ) : (
                  <Label key={uuidv4()} color={'orange'}>
                    NO
                  </Label>
                )}
              </Typography>
            )
          },
        },
      },
      {
        name: 'stage_created_at',
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
        name: 'stage_updated_at',
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
    if (!stagesData.length) return []

    return stagesData.map((stage) => {
      stage.stage_created_at = utcToChile(stage.stage_created_at)
      stage.stage_updated_at = stage.stage_updated_at ? utcToChile(stage.stage_updated_at) : '-'
      return stage
    })
  }

  // Loading
  if (isLoading) return <Loader active content="Cargando..." size="massive" />

  // Open modal
  if (modalContent) {
    return (
      <Modal dimmer="blurring" onClose={() => closeModal()} onOpen={() => setOpenModal(true)} open={openModal} size="small">
        <Modal.Content>
          <Stages stage={modalContent} headerPageIcon={stageIcon} sendStage={sendStage} closeModal={closeModal} />
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
      titleIcon={<Icon circular inverted name={stageIcon} size="small" />}
      title="Versiones"
      columns={tableColumns()}
      data={tableContent()}
      buttons={[editButton]}
      showCreateButton={false}
      createButtonAction={addButton()}
      createButtonTooltip="Agregar Versión"
    />
  )
}

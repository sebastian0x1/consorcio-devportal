import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Icon, Label, Modal, Loader, Button, List } from 'semantic-ui-react'
import swal from 'sweetalert'
import { v4 as uuidv4 } from 'uuid'
import { Typography } from '@material-ui/core'
import { traduccionColores } from '../Consts'

import { utcToChile } from '../../../utils/time'
import API from '../../../api/index'
import TableTemplate from '../TableTemplate'
import Roles from './Roles'
import { login } from '../../../services/self'

const DEFAULT_ROLE_ID = 1 

function AbmRoles({ roleIcon, refreshToken, idCognito, idRole, userPermissions }) {
  const [rolesData, setRolesData] = useState([])
  const [modalContent, setModelContent] = useState({ type: null, data: null })
  const [newChange, setNewChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  let isMock = false

  const errors = {
    create_title: 'Error al crear el Rol!',
    update_title: 'Error al actualizar el Rol!',
    delete_title: 'Error al eliminar el Rol!',
    retry: 'Intente nuevamente.',
    default: 'No es posible eliminar el Rol Default',
  }

  // Load Data
  useEffect(() => getRoles(), [newChange])

  const getRoles = async () => {
    // Loading
    setIsLoading(true)

    // New Changes
    setNewChange(false)

    // Get Roles
    let result = await API.listRoles(isMock)
    setRolesData(result.data || [])

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
    action: (role) => {
      //console.log('DELETE', role)
      deleteRole(role)
    },
  }

  const editButton = {
    type: 'update',
    tooltip: 'Editar',
    // eslint-disable-next-line no-loop-func
    action: (role) => {
      // console.log('EDIT', role)
      openModalForModify('edit', role)
    },
  }

  const addButton = () => {
    //console.log('addButton')
    openModalForModify('add', null)
  }

  // Extra validations
  const afterRequestValidations = async (params) => {
    // console.log('DATOS DE TOKEN')
    // console.log('refreshToken', refreshToken)
    // console.log('idCognito', idCognito)

    let same_permissions =
      params.role_permissions.length === userPermissions.length &&
      params.role_permissions.every(function (element, index) {
        return element === userPermissions[index]
      })

    // Check if same role..
    if (modalContent.data.role_id === Number(idRole) && !same_permissions) {
      // New request to get new token
      let result = await API.refreshTokens(isMock, refreshToken, idCognito)
      // console.log('result.refreshTokens', result)

      // Check status
      if (result.status !== 200) {
        // Error msg
        swal({
          title: errors.update_title,
          text: errors.retry,
          icon: 'error',
          button: true,
        })

        return
      }

      // Update Tokens
      login({
        idToken: result.data.id_token,
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
      })
    }

    // Show alert
    swal({
      title: 'Rol actualizado correctamente!',
      icon: 'success',
      button: true,
    })
  }

  // Send request to insert/update/delete
  const sendRole = async (params, role_id = undefined) => {
    // Close Modal
    setOpenModal(false)

    // Set Loading
    setIsLoading(true)

    // Check operation
    if (modalContent.data !== null) {
      // Update
      let result = await API.updateRole(isMock, role_id, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Extra validations
        await afterRequestValidations(params)
      } else {
        swal({
          title: errors.update_title,
          text: errors.retry,
          icon: 'error',
          button: true,
        })
      }
    } else {
      // Insert
      let result = await API.createRole(isMock, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'Rol creado correctamente!',
          icon: 'success',
          button: true,
        })
      } else {
        swal({
          title: errors.create_title,
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

  const deleteRole = async ({ role_id, role_name }) => {
    // Wait for value
    let value = await swal({
      title: `Desea borrar el Rol: ${role_name}?`,
      text: 'Una vez eliminado, no se podrá recuperar.',
      icon: 'warning',
      buttons: ['Cancelar', true],
      dangerMode: true,
    })
    
    // value === null, canceled
    // value === true, ok
    if (value === null) return

    if(role_id !== DEFAULT_ROLE_ID){
      // Call deletion API
      let result = await API.deleteRole(isMock, role_id)

      // Notify if it was deleted ok
      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'Rol eliminado correctamente!',
          icon: 'success',
          button: true,
        })
      } else {
          swal({
            title: errors.delete_title,
            text: errors.retry,
            icon: 'error',
            button: true,
          })
        }
    } else {
        swal({
          title: errors.delete_title,
          text: errors.default,
          icon: 'error',
          button: true,
        })
    }

  }

  // Table Content
  const tableColumns = () => {
    return [
      {
        name: 'role_id',
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
        name: 'role_name',
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
        name: 'role_description',
        label: 'Descripción',
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
        name: 'role_color',
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
        name: 'role_business_lines',
        label: 'Líneas de Negocio',
        options: {
          display: true,
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <List horizontal>
                {value.map((bs) => (
                  <List.Item key={uuidv4()}>
                    <Label key={uuidv4()} color={bs.business_line_color}>
                      {bs.business_line_name}
                    </Label>
                  </List.Item>
                ))}
              </List>
            )
          },
        },
      },
      {
        name: 'role_permissions',
        label: 'Permisos',
        options: {
          display: true,
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <List horizontal>
                {value.map((perm) => (
                  <List.Item key={uuidv4()}>
                    <Label key={uuidv4()} color={perm.permission_color}>
                      {perm.permission_name}
                    </Label>
                  </List.Item>
                ))}
              </List>
            )
          },
        },
      },
      {
        name: 'role_created_at',
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
        name: 'role_updated_at',
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
    if (!rolesData.length) return []

    return rolesData.map((role) => {
      role.role_created_at = utcToChile(role.role_created_at)
      role.role_updated_at = role.role_updated_at ? utcToChile(role.role_updated_at) : '-'
      return role
    })
  }

  // Loading
  if (isLoading) return <Loader active content="Cargando..." size="massive" />

  // Open modal
  if (modalContent.type) {
    return (
      <Modal dimmer="blurring" onClose={() => closeModal()} onOpen={() => setOpenModal(true)} open={openModal} size="small">
        <Modal.Content>
          <Roles role={modalContent.data} headerPageIcon={roleIcon} sendRole={sendRole} />
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
      titleIcon={<Icon circular inverted name={roleIcon} size="small" />}
      title="Roles"
      columns={tableColumns()}
      data={tableContent()}
      buttons={[editButton, deleteButton]}
      showCreateButton={true}
      createButtonAction={addButton}
      createButtonTooltip="Agregar Rol"
    />
  )
}

function mapState(state) {
  return {
    roleIcon: 'address card outline',
    refreshToken: state.auth.refreshToken,
    idCognito: state.auth.idCognito,
    idRole: state.auth.idRole,
    userPermissions: state.auth.userPermissions,
  }
}

const AbmRolesWrapped = connect(mapState, null)(AbmRoles)

export default AbmRolesWrapped

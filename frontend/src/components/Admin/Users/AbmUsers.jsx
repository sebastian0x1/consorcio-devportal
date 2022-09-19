import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Icon, Label, Modal, Loader, Button } from 'semantic-ui-react'
import swal from 'sweetalert'
import { v4 as uuidv4 } from 'uuid'
import { Typography } from '@material-ui/core'

import { utcToChile } from '../../../utils/time'
import API from '../../../api/index'
import TableTemplate from '../TableTemplate'
import Users from './Users'
import { login, logout } from '../../../services/self'
import axios from 'axios'

function AbmUsers({ userIcon, isADUser, refreshToken, idCognito, idRole }) {
  const [usersData, setUsersData] = useState([])
  const [modalContent, setModelContent] = useState({ type: null, data: null })
  const [newChange, setNewChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  let isMock = false

  // Load Data
  useEffect(() => getUsers(), [newChange])

  const getUsers = async () => {
    // Loading
    setIsLoading(true)

    // New Changes
    setNewChange(false)

    // Get Users
    let result = await API.getUsers(isMock)
    //console.log(result)
    setUsersData(result.data || [])

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
    action: (user) => {
      //console.log('DELETE', user)
      deleteUser(user)
    },
  }

  const editButton = {
    type: 'update',
    tooltip: 'Editar',
    // eslint-disable-next-line no-loop-func
    action: (user) => {
      //console.log('EDIT', user)
      openModalForModify('edit', user)
    },
  }

  const addButton = () => {
    //console.log('addButton')
    openModalForModify('add', null)
  }

  // Extra validations
  const afterRequestValidations = async ({ user_active, user_role_id }) => {
    // Check if its the same user
    if (modalContent.data.user_id_cognito !== idCognito) return

    // Change active status
    if (!user_active) {
      // Show alert
      swal({
        title: 'Su Usuario ha sido desactivado!',
        icon: 'info',
        button: true,
      }).then(() => logout())

      return
    }

    // Same role..
    if (user_role_id === idRole) return

    // New request to get new token
    let result = await API.refreshTokens(isMock, refreshToken, idCognito, isADUser)
    // console.log('result.refreshTokens', result)

    // Check status
    if (result.status !== 200) {
      // Error msg
      swal({
        title: 'Error al actualizar Usuario!',
        text: 'Intente nuevamente.',
        icon: 'error',
        button: true,
      })

      return
    }

    if (isADUser) {
      const urlSSOValidate = process.env.REACT_APP_APIURL.concat('/users/sso_validate')
      let {
        data: { user_role, user_permissions },
      } = await axios.post(urlSSOValidate, { IDToken: result.data.id_token })
      // console.log('user_role: ', user_role, 'user_permissions: ', user_permissions)
      login({
        idToken: result.data.id_token,
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
        userRole: user_role,
        userPermissions: user_permissions,
      })
    } else {
      // Update Tokens
      login({
        idToken: result.data.id_token,
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
      })
    }
  }

  const afterValidationsDelete = async (user_id_cognito) => {
    // console.log('afterValidationsDelete')
    // console.log('user_id_cognito: ', user_id_cognito)
    // console.log('idCognito: ', idCognito)

    // Check if its the same user
    if (user_id_cognito !== idCognito) return

    // Change active status
    // Show alert
    swal({
      title: 'Su Usuario ha sido eliminado!',
      icon: 'info',
      button: true,
    }).then(() => logout())

    return
  }

  // Send request to insert/update/delete
  const sendUser = async (params, id_cognito = undefined) => {
    // Close Modal
    setOpenModal(false)

    // Set Loading
    setIsLoading(true)

    // Check operation
    if (modalContent.data !== null) {
      // Update
      let result = await API.updateUser(isMock, id_cognito, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'Usuario actualizado correctamente!',
          icon: 'success',
          button: true,
        })

        // Extra validations
        await afterRequestValidations(params)
      } else {
        swal({
          title: 'Error al actualizar el Usuario!',
          text: 'Intente nuevamente.',
          icon: 'error',
          button: true,
        })
      }
    } else {
      // Insert
      let result = await API.createUser(isMock, params)

      if (result.status === 204) {
        // Notify there was a change
        setNewChange(true)

        // Show alert
        swal({
          title: 'Usuario creado correctamente!',
          icon: 'success',
          button: true,
        })
      } else {
        swal({
          title: 'Error al crear el Usuario!',
          text: result.data || 'Error al crear el Usuario!',
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

  const deleteUser = async ({ user_name, user_role_name, user_id_cognito }) => {
    // Wait for value
    let name = user_name.length > 25 ? user_name.substring(0, 25) + '...' : user_name
    let value = await swal({
      title: `Desea borrar el Usuario: \n ${name} (${user_role_name})?`,
      text: 'Una vez eliminado, no se podrá recuperar.',
      icon: 'warning',
      buttons: ['Cancelar', true],
      dangerMode: true,
    })

    if (value === null) return

    // Call deletion API
    let result = await API.deleteUser(isMock, user_id_cognito)

    // Notify if it was deleted ok
    if (result.status === 204) {
      // Notify there was a change
      setNewChange(true)

      // Show alert
      swal({
        title: 'Usuario eliminado correctamente!',
        icon: 'success',
        button: true,
      })

      // Extra validations
      await afterValidationsDelete(user_id_cognito)
    } else {
      swal({
        title: 'Error al eliminar el Usuario!',
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
        name: 'user_id',
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
        name: 'user_name',
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
        name: 'user_email',
        label: 'E-Mail',
        options: {
          display: true,
          filter: true,
          sort: false,
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
        name: 'user_role_name',
        label: 'Rol',
        options: {
          display: true,
          filter: true,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            let role_color = usersData[tableMeta.rowIndex].user_role_color
            return (
              <Typography component={'span'} noWrap={false}>
                <Label key={uuidv4()} color={role_color}>
                  {value}
                </Label>
              </Typography>
            )
          },
        },
      },
      {
        name: 'user_active',
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
        name: 'user_created_at',
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
        name: 'user_updated_at',
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
    if (!usersData.length) return []

    return usersData.map((user) => {
      user.user_created_at = utcToChile(user.user_created_at)
      user.user_updated_at = user.user_updated_at ? utcToChile(user.user_updated_at) : '-'
      return user
    })
  }

  // Loading
  if (isLoading) return <Loader active content="Cargando..." size="massive" />

  // Open modal
  if (modalContent.type) {
    return (
      <Modal dimmer="blurring" onClose={() => closeModal()} onOpen={() => setOpenModal(true)} open={openModal} size="small">
        <Modal.Content>
          <Users user={modalContent.data} isADUser={isADUser} headerPageIcon={userIcon} sendUser={sendUser} />
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
      titleIcon={<Icon circular inverted name={userIcon} size="small" />}
      title="Usuarios"
      columns={tableColumns()}
      data={tableContent()}
      buttons={[editButton, deleteButton]}
      showCreateButton={true}
      createButtonAction={addButton}
      createButtonTooltip="Agregar Usuario"
    />
  )
}

function mapState(state) {
  return {
    userIcon: 'users',
    refreshToken: state.auth.refreshToken,
    idCognito: state.auth.idCognito,
    idRole: state.auth.idRole,
    isADUser: state.auth.isADUser,
  }
}

const AbmUsersWrapped = connect(mapState, null)(AbmUsers)

export default AbmUsersWrapped

import React, { useState,useEffect } from 'react'
import { connect } from "react-redux"
import { Button, Form, Header, Segment, Icon, Loader, Modal } from 'semantic-ui-react'
import swal from 'sweetalert'
import API from '../../api/index'
import { login, logout } from '../../services/self'

let isMock = false


function ConfigCredentials({
    setOpenModal,
    refreshToken,
    idCognito,
    isADUser,
    ssoClientSecret,
    ssoClientID,
    ssoUsername,
    ssoPassword,
    realm,
    grantType
}) {

    const grantTypes = [
    { key: 'password', text: 'Password', value: 'password' },
    { key: 'client_credentials', text: 'Client credentials', value: 'client_credentials' }
    ]

    const [data, setData] = useState({
        ssoClientSecret: ssoClientSecret || '',
        ssoClientID: ssoClientID || '',
        ssoUsername: ssoUsername || '',
        ssoPassword: ssoPassword || '',
        realm: realm || '',
        grantType: grantType || '',
        isADUser: isADUser,
    })
    const [errors, setErrors] = useState({})
    const [options_, setOptions] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => getRealms(), [])

    const getRealms = async () => {
      // Loading
      setIsLoading(true)
      // Get APIs
      let result = await API.getRealms()
      let mydata = result.data.map((realm)=>{
          return {key:realm.realm_name , value:realm.realm_name, icon:'linkify', text: realm.realm_name}
      })
      setOptions(mydata || [])
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
        - 2 < str < 50 (str)
        */
        if (data.grantType === '') {
            setErrors({
                ...errors,
                grantType: {
                    content: 'Debe seleccionar una opción para el campo Grant type.',
                    pointing: 'below',
                },
            })

            return false
        } else
            removeError('grantType')

        if (data.realm === '') {
            setErrors({
                ...errors,
                realm: {
                    content: 'Debe seleccionar una opción para el campo Reino.',
                    pointing: 'below',
                },
            })

            return false
        } else {
            removeError('realm')
        }

        if (data.ssoClientSecret.length < 2 || data.ssoClientSecret.length > 50) {
            setErrors({
                ...errors,
                ssoClientSecret: {
                    content: 'El Client Secret debe tener entre 2 y 50 caracteres.',
                    pointing: 'below',
                },
            })

            return false
        } else {
            removeError('ssoClientSecret')
        }

        if (data.ssoClientID.length < 2 || data.ssoClientID.length > 50) {
            setErrors({
                ...errors,
                ssoClientID: {
                    content: 'El Client ID debe tener entre 2 y 50 caracteres.',
                    pointing: 'below',
                },
            })

            return false
        } else {
            removeError('ssoClientID')
        }

        return true
    }

    const testCredentials = async () => {
        // Invalido, no envia nada
        if (!makeValidations()) return

        // Loading
        setIsLoading(true)

        // Request
        let request = await API.getSSOToken(isMock, data)

        if( request.status === 200 ) {
            swal({
                title: 'Credenciales válidas!',
                icon: 'success',
                button: true,
            })
        } else {
            swal({
                title: 'Credenciales inválidas!',
                text: 'Intente nuevamente con otras credenciales.',
                icon: 'error',
                button: true,
            })
        }

        // Loading
        setIsLoading(false)
    }

    const saveCredentials = async () => {
        // Invalido, no envia nada
        if (!makeValidations()) return

        // Loading
        setIsLoading(true)

        // Request
        let result = await API.setSSOToken(isMock, idCognito, data)

        if( result.status !== 204 ) {
            // Error msg
            swal({
                title: 'Error al actualizar Credenciales!',
                text: 'Intente nuevamente.',
                icon: 'error',
                button: true,
            })

            // Loading
            setIsLoading(false)

            return
        }

        // New request to get new token
        result = await API.refreshTokens(isMock, refreshToken, idCognito, isADUser)
        // console.log("result.refreshTokens", result)

        // Check status
        if ( result.status === 403 ) {
            swal({
                title: 'Error al guardar Credenciales!',
                text: 'Sesión vencida. Vuelva a iniciar sesión.',
                icon: 'error',
                button: true,
            }).then(() => { logout() })

        } else if ( result.status !== 200 ) {
            // Error msg
            swal({
                title: 'Error al guardar Credenciales!',
                text: 'Intente nuevamente.',
                icon: 'error',
                button: true,
            })

            // Loading
            setIsLoading(false)

            return
        }
        
        // Update Tokens
        login({
            idToken: result.data.id_token,
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
        })

        // MSG
        swal({
            title: 'Credenciales guardadas exitosamente!',
            icon: 'success',
            button: true,
        })

        // Loading
        setIsLoading(false)
    }

    const modalContent = () => {
        return (
            <>
                <Form>
                    <Segment raised>
                        <Form.Select
                            fluid
                            search
                            selection
                            required
                            label="Reino"
                            placeholder="Reino"
                            name="reino"
                            value={data.realm}
                            options={options_}
                            onChange={(e, { value }) => setData({ ...data, realm: value.trim() })}
                            error={errors.realm && errors.realm.content} />  
                        <Form.Select
                            fluid
                            selection
                            required
                            label="Grant type"
                            placeholder="Grant type..."
                            name="ssoGrantType"
                            value={data.grantType}//grantType
                            options={grantTypes}
                            onChange={(e, { value }) => setData({ ...data, grantType: value.trim() })}
                            error={errors.grantType && errors.grantType.content}
                        />
                        <Form.Input
                            fluid
                            required
                            icon="vcard"
                            iconPosition="left"
                            label="Client ID"
                            placeholder="Client ID..."
                            name="ssoClientID"
                            value={data.ssoClientID}
                            onChange={(e, { value }) => setData({ ...data, ssoClientID: value.trim() })}
                            error={errors.ssoClientID && errors.ssoClientID.content}
                        />
                        <Form.Input
                            fluid
                            required
                            icon="user secret"
                            iconPosition="left"
                            label="Client Secret"
                            placeholder="Client Secret..."
                            name="ssoClientSecret"
                            value={data.ssoClientSecret}
                            onChange={(e, { value }) => setData({ ...data, ssoClientSecret: value.trim() })}
                            error={errors.ssoClientSecret && errors.ssoClientSecret.content}
                        />
                        <Form.Input
                            fluid                            
                            icon="list"
                            iconPosition="left"
                            label="Username"
                            placeholder="Username..."
                            name="ssoUsername"
                            value={data.ssoUsername}
                            onChange={(e, { value }) => setData({ ...data, ssoUsername: value.trim() })}
                        />
                        <Form.Input
                            fluid                    
                            type='password'
                            icon="lock open"
                            iconPosition="left"
                            label="Password"
                            placeholder="Password..."
                            name="ssoPassword"
                            value={data.ssoPassword}
                            onChange={(e, { value }) => setData({ ...data, ssoPassword: value.trim() })}
                        />
                    </Segment>
                </Form>
            </>
        )
    }

    const modalActions = () => {
        return (
            <>
                <Button
                    color="blue"
                    size="medium"
                    onClick={() => testCredentials()}
                >
                    <Icon name='plug' /> Test
                </Button>
                <Button
                    color="green"
                    size="medium"
                    onClick={() => saveCredentials()}
                >
                    <Icon name='save' /> Guardar
                </Button>
                <Button
                    color="red"
                    size="medium"
                    onClick={() => setOpenModal(false)}
                >
                    <Icon name='remove' /> Cerrar
                </Button>
            </>
        )
    }

    return (
        <>
            <Header as="h1">
                <Icon circular inverted name={'lock'} />
                Configurar Credenciales
            </Header>
            <Modal.Content>
                {isLoading && <Loader active content="Cargando..." size="massive" />}
                {modalContent()}
            </Modal.Content>
            <Modal.Actions>
                {modalActions()}
            </Modal.Actions>
        </>
    )
}

function mapState(state) {
    return {
        refreshToken: state.auth.refreshToken,
        idCognito: state.auth.idCognito,
        ssoClientSecret: state.auth.ssoClientSecret,
        ssoClientID: state.auth.ssoClientID,
        ssoUsername: state.auth.ssoUsername,
        ssoPassword: state.auth.ssoPassword,
        realm: state.auth.realm,
        grantType: state.auth.grantType,
        isADUser: state.auth.isADUser
    }
}

const ConfigCredentialsWrapped = connect(
    mapState,
    null
)(ConfigCredentials);

export default ConfigCredentialsWrapped
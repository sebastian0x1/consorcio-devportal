import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Form, Grid, Message, Segment } from 'semantic-ui-react'
import swal from 'sweetalert'
import API from '../api/index'

const textos = {
  titulo: 'Recuperar Contraseña',
  botonEnviarCodigo: 'Enviar',
  botonEnviarEmail: 'Enviar Email',
  errorLimitExceeded: {
    title: 'Se excedió el límite de intentos.',
    text: 'Intente después de un tiempo.',
  },
  errorCodeMismatch: {
    title: 'Se proporcionó un código de verificación no válido.',
    text: 'Intente nuevamente.',
  },
  errorDefault : {
    title: 'Error al cambiar la contraseña!',
    text: 'Intente nuevamente.',
  }
}

const RecoveryPassword = () => {
  const [email, setEmail] = useState('')
  const [emailToSend, setEmailToSend] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorText, setErrorText] = useState('')
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (params.email !== undefined && params.email !== '') {
      setEmail(params.email)
      // console.log(params.email)
    }
  }, [params])

  async function HandleEnviarEmail() {
    if (emailToSend === '') {
      setErrorText('Debe completar todos los campos')
    } else {
      let result = await API.forgotPassword(false, emailToSend)
      if (result) {
        swal({
          title: 'Se envió el código de verificación a la dirección de correo!',
          icon: 'success',
          button: true,
        }).then(() => navigate(`/recoverypassword/${emailToSend}`))
      } else {
        swal({
          title: 'Error al intentar enviar el código de verificación!',
          text: 'Intente nuevamente.',
          icon: 'error',
          button: true,
        })
      }
    }
  }

  const sendPasswords = () => {
    if (verificationCode === '' || password === '' || confirmPassword === '') {
      setErrorText('Debe completar todos los campos')
    } else {
      if (password !== confirmPassword) {
        setErrorText('Las contraseñas no son iguales')
        return
      } else {
        sendData()
      }
    }
  }

  const sendData = async () => {
    // Creacion
    let obj = {
      verificationCode: verificationCode,
      password: password,
      confirm_password: confirmPassword,
      user_email: email,
    }

    let result = await API.resetPassword(false, obj)
    // console.log('API.resetPassword =>', result)

    if (result.status) {
      // Notify there was a change
      // Show alert
      swal({
        title: 'Se cambió la contraseña correctamente!',
        icon: 'success',
        button: true,
      }).then(() => navigate(`/login`))
    } else {
      let error = getErrorMesage(result.data)
      swal({
        title: error.title,
        text: error.text,
        icon: 'error',
        button: true,
      })
    }
  }

  const getErrorMesage = (code) => {
    switch (code) {
      case 'CodeMismatchException':
        return textos.errorCodeMismatch
      case 'LimitExceededException':
        return textos.errorLimitExceeded
      default:
        return textos.errorDefault
    }
  }

  return (
    <div style={{ padding: '25vh', background: 'gray', height: '100vh' }}>
      <Grid textAlign="center" verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Form size="large">
            {email === '' ? (
              <Segment textAlign="left">
                <h3 style={{ textAlign: 'center' }}>{textos.titulo}</h3>
                <br />
                <Form.Input
                  fluid
                  name="email"
                  label="Email"
                  labelPosition="left"
                  icon="at"
                  iconPosition="left"
                  onChange={(e, { value }) => {
                    setEmailToSend(value)
                    setErrorText('')
                  }}
                  placeholder="name@host.com"
                />
                <a href="/login">Volver al Login</a>
                <br />
                <br />
                <Button fluid onClick={HandleEnviarEmail} color="teal" size="large">
                  {textos.botonEnviarEmail}
                </Button>
              </Segment>
            ) : (
              <Segment>
                <h3 style={{ textAlign: 'center' }}>{textos.titulo}</h3>
                <br />
                <Form.Input
                  fluid
                  icon="keyboard"
                  iconPosition="left"
                  placeholder="Código de confirmación"
                  value={verificationCode}
                  onChange={(e, { value }) => {
                    setVerificationCode(value)
                    setErrorText('')
                  }}
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="Nueva Contraseña"
                  type="password"
                  value={password}
                  onChange={(e, { value }) => {
                    setPassword(value)
                    setErrorText('')
                  }}
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="Confirmar Contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(e, { value }) => {
                    setConfirmPassword(value)
                    setErrorText('')
                  }}
                />
                <a href="/login">Volver al Login</a>
                <br />
                <br />
                <Button color="teal" fluid size="large" onClick={() => sendPasswords()}>
                  {textos.botonEnviarCodigo}
                </Button>
              </Segment>
            )}
          </Form>
          {errorText !== '' && <Message error header="Error" content={errorText} />}
        </Grid.Column>
      </Grid>
    </div>
  )
}

export default RecoveryPassword

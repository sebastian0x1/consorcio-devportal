import React, { useEffect, useState } from 'react'
import { Button, Form, Grid, Divider, Segment, Input } from 'semantic-ui-react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/index'

const VerificationCode = () => {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => getEmail(), [])

  const getEmail = () => (validateEmail() ? setEmail(params.email) : '')

  const handleChangeCode = (event) => {
    setCode({
      ...code,
      code: event.target.value,
    })
  }

  const sendCode = async () => {
    /* TO DO: API ValidateCode */
    let result = await API.confirmUser(email, code.code)
    if (result === 'SUCCESS') {
      navigate('/apis')
    } else {
      alert('Código inválido.')
    }
  }

  const resendCode = () => {
    let result = '' /* TO DO: API ResendCode */
    if (result) {
      alert('Código reenviado.')
    } else {
      alert('Error al reenviar el código.')
    }
  }

  const validateEmail = () => params.email !== undefined && params.email !== ''

  return (
    <>
      <div style={{ padding: '25vh', background: 'gray', height: '100vh' }}>
        <Grid textAlign="center" verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 420 }}>
            <Form>
              {validateEmail() ? (
                <Segment textAlign="left">
                  <h3 style={{ textAlign: 'center' }}>Verificar Cuenta</h3>
                  <Divider />
                  <p>
                    Hemos enviado un código por correo electrónico a {email}
                    <br />
                    <br />
                    Ingréselo a continuación para confirmar su cuenta.
                  </p>
                  <b>
                    <label>Código de verificación&nbsp;&nbsp;</label>
                  </b>
                  <Input size="mini">
                    <input data-testid="my-input-1" onChange={handleChangeCode} />
                  </Input>
                  <br />
                  <br />
                  <Button color="teal" fluid size="large" onClick={() => sendCode()}>
                    Confirmar cuenta
                  </Button>
                  <br />
                  <p style={{ textAlign: 'center' }}>
                    ¿No recibiste un código?&nbsp;&nbsp;&nbsp;
                    <button className="ui teal basic button mini" onClick={() => resendCode()}>
                      Reenvialo
                    </button>
                  </p>
                </Segment>
              ) : (
                <Segment>
                  <h3 style={{ textAlign: 'center' }}>Verificar Cuenta</h3>
                  <Divider />
                  <i className="exclamation triangle icon huge" style={{ color: 'red' }}></i>
                  <h3>No se ingresó ningún email</h3>
                </Segment>
              )}
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    </>
  )
}

export default VerificationCode

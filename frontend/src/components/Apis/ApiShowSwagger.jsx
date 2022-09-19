import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Icon, Loader } from 'semantic-ui-react'
import SwaggerUi from 'swagger-ui'

import API_AXIOS from '../../api/index'
import useQuery from '../../hooks/useQuery'

import 'swagger-ui/dist/swagger-ui.css'
import swal from 'sweetalert'

import axiosApiInstance from '../../api/axios'

const FORBIDDEN_STAGES = ['prod', 'production']
const isMock = false
const SSO_INTERVAL_TIME = 4 * 60 * 1000

function capitalize(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function ApiShowSwagger({
  business_line,
  tag_account_name,
  apiId,
  stage,
  ssoClientSecret,
  ssoClientID,
  ssoUsername,
  ssoPassword,
  realm,
  grantType,
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState(null)
  const [currentSwagger, setCurrentSwagger] = useState(null)
  const [isProdApi, setIsProdApi] = useState(true)
  const mountedRef = useRef(true)
  const navigate = useNavigate()
  const query = useQuery()
  let is_external = parseInt(query.get('ext'))
  if (isNaN(is_external)) is_external = 1

  // Con este plugin que se utiliza en la definición de swaggerui mas abajo 
  // se esconde el recuadro de curl y se evita mostrar el token de autenticación
  const HideCurlPlugin = () => {
    return {
      wrapComponents: {
        curl: () => () => null,
        // requesturl: () => () => null,
      }
    }
  }

  const DisableTryItOutPlugin = function() {
    return {
      statePlugins: {
        spec: {
          wrapSelectors: {
            allowTryItOutFor: () => () => !isProdApi
          }
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    //TODO: esto está así para hacer pruebas, chquear con el cliente los casos de uso respecto a credenciales
    // if(is_external) return

    const intervalID = setInterval(() => {
      tokenRequest()
    }, SSO_INTERVAL_TIME)

    if (!token) tokenRequest()

    return () => clearInterval(intervalID)
  }, [])

  useEffect(() => {
    const getSwaggerApi = async () => {
      // Loading
      setIsLoading(true)

      // Get definition
      let result = await API_AXIOS.getSwagger(isMock, tag_account_name, stage, apiId)
      if (result) {
        setIsProdApi(tag_account_name === 'prod')

        // Set credentials off or on in swagger

        // Set swagger
        result = result.data
        if (currentSwagger !== result) setCurrentSwagger(result)

        // Loading
        setIsLoading(false)
      }
    }

    // Load swagger
    if (apiId && stage) getSwaggerApi()
  }, [apiId, stage])

  useEffect(() => {
    if (currentSwagger !== null) {
      let destination = document.getElementById('swaggerContainer')
      
      if (destination) {
        if (!currentSwagger.api_swagger) {
          swal({
            title: 'Archivo inválido o inexistente.',
            icon: 'error',
            button: true,
          }).then(() => navigate(-1))
        }
        const securityDefinitions = currentSwagger.api_swagger?.securityDefinitions
          ? Object.keys(currentSwagger.api_swagger.securityDefinitions)[0]
          : null

        let ui = SwaggerUi({
          dom_id: '#swaggerContainer',
          spec: currentSwagger.api_swagger,
          presets: [SwaggerUi.presets.apis],
          supportedSubmitMethods: FORBIDDEN_STAGES.includes(stage)
            ? []
            : ['get', 'delete', 'post', 'delete', 'patch', 'put', 'options', 'head', 'trace'],
          requestInterceptor: async (req) => {
            // console.log('requestInterceptor => req: ', req)

            //TODO: agregar validacion para que ingrese solo con apis privadas
            // if(params.url.contains('vpce-')) {

              let params = {
                url:req.url,
                body:req.body,
                headers:req.headers,
                method:req.method
              }
              
              if (token) params.headers.Authorization = `${capitalize(token.token_type)} ${token.access_token}`

              req.url = process.env.REACT_APP_APIURL + '/apis/interceptorSwagger'
              req.body = JSON.stringify(params)
              req.method = 'POST'
              
            // }
            

            // OBTENCIÓN ACCESS_TOKEN PARA LAMBDA AUTHORIZER
             await axiosApiInstance.get(`/pingApi`).then((res) => {
              // console.log('res => ', JSON.stringify(res))
              req.headers.Authorization = res.config.headers.Authorization
            })
            req.headers.accept = 'application/json, text/plain, */*'
            
            // console.log('req final => ', req)
            return req
          },
          onComplete: () => {
            ui.preauthorizeApiKey(securityDefinitions ?? null, `Bearer ${token.access_token}`)
          },
          plugins: [
            HideCurlPlugin,
            DisableTryItOutPlugin
          ],
        })
      }
    }
  }, [currentSwagger, stage, token])

  const tokenRequest = async () => {
    // console.log('Pidiendo token...')
    let result = await API_AXIOS.getSSOToken(isMock, { ssoClientSecret, ssoClientID, ssoUsername, ssoPassword, realm, grantType })
    // console.log(result.status, result.data)
    setToken(result.status === 428 ? null : result.data)
  }

  return (
    <div className="swagger-ui-wrap" style={{ padding: '0 1.25rem' }}>
      {isLoading === true && <Loader active size="massive" content="Cargando..." />}
      <div style={{ padding: '2rem 1.25rem' }}>
        <Button color={'yellow'} onClick={() => navigate(`/apis/${business_line}`)}>
          <Icon name="arrow left" /> VOLVER A LA TABLA
        </Button>
      </div>
      <div id="swaggerContainer" />
    </div>
  )
}

function mapState(state) {
  return {
    ssoClientSecret: state.auth.ssoClientSecret,
    ssoClientID: state.auth.ssoClientID,
    ssoUsername: state.auth.ssoUsername,
    ssoPassword: state.auth.ssoPassword,
    realm: state.auth.realm,
    grantType: state.auth.grantType,
  }
}

const ApiShowSwaggerWrapped = connect(mapState, null)(ApiShowSwagger)

export default ApiShowSwaggerWrapped

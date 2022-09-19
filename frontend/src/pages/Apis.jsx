import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Container, Header, Icon, Loader } from 'semantic-ui-react'

import API_AXIOS from '../api/index'
import ApiShowSwagger from '../components/Apis/ApiShowSwagger'
import ApisMenuTable from '../components/Apis/ApisMenuTable'
import ApisMenu from '../components/Apis/ApisMenu'
import ApiSearch from '../components/Apis/ApiSearch'
import PageWithSidebar from '../components/PageWithSidebar'

const isMock = false

function ApisPage({ idRole }) {
  const [apiList, setApiList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { business_line, apiId, stage, tag_account_name } = useParams()

  useEffect(() => {
    const updateApi = async () => {
      setIsLoading(true)

      let result = await API_AXIOS.listAPIS(isMock, idRole)
      setApiList(result.data)

      setIsLoading(false)
    }

    if (idRole) updateApi()
  }, [idRole])

  const pageContent = () => {
    if (isLoading) {
      return <Loader active size="massive" content="Cargando..." />
    } else if (business_line === 'search') {
      return <ApiSearch apiList={apiList} />
    } else {
      if (apiList.length < 1) {
        return (
          <>
            <Header as="h2" icon textAlign="center" style={{ padding: '2.5rem 0px' }}>
              <Icon name="warning sign" circular />
              <Header.Content>No hay APIs publicadas!</Header.Content>
            </Header>
            <Container text textAlign="center">
              <p>Contacte a un administrador para que le agregue APIs a su cuenta.</p>
            </Container>
          </>
        )
      } else if (!business_line) {
        return (
          <>
            <Header as="h2" icon textAlign="center" style={{ padding: '2.5rem 0px' }}>
              <Icon name="info" circular />
              <Header.Content>Elija una Línea de Negocio</Header.Content>
            </Header>
            <Container text textAlign="center">
              <p>Al seleccionar una línea de negocio podrá elegir una API.</p>
            </Container>
          </>
        )
      } else if (!apiId) {
        return <ApisMenuTable business_line={business_line} data={apiList} />
      } else {
        return <ApiShowSwagger business_line={business_line} tag_account_name={tag_account_name} apiId={apiId} stage={stage} />
      }
    }
  }

  return (
    <PageWithSidebar
      sidebarContent={<ApisMenu apiList={apiList} isLoading={isLoading} business_line={business_line} />}
      SidebarPusherProps={{ className: 'swagger-section' }}
    >
      <div className="swagger-ui-wrap" style={{ padding: '0 1.25rem' }}>
        {pageContent()}
      </div>
    </PageWithSidebar>
  )
}

function mapState(state) {
  return {
    idRole: state.auth.idRole,
  }
}

const ApisPageWrapped = connect(mapState, null)(ApisPage)

export default ApisPageWrapped

import React from 'react'
import { Link } from 'react-router-dom'
import { Loader } from 'semantic-ui-react'

import Sidebar from '../Sidebar/Sidebar'
import SidebarHeader from '../Sidebar/SidebarHeader'
import MenuLink from '../MenuLink'


export default function ApisMenu({
  apiList,
  isLoading,
  business_line,
}) {
  // If we're still loading, display a spinner.
  // If we're not loading, and we don't have any apis, display a message.
  // If we're not loading, and we have some apis, render the appropriate api subsections for apiGateway and generic apis
  if (isLoading) {
    return <Loader style={{ color: 'whitesmoke' }} active content="Cargando..." size="massive" />
  }

  if (apiList.length < 1) {
    return <p style={{ padding: '13px 16px', color: 'whitesmoke' }}>No hay APIs publicadas</p>
  }

  return (
    <Sidebar>
      <SidebarHeader as={Link} className="item" to="/apis/search" style={{ fontWeight: '400', fontSize: '1.5em' }}>
        Buscar APIs
      </SidebarHeader>

      <SidebarHeader style={{ fontWeight: '400', fontSize: '1.5em' }}>
        APIs
      </SidebarHeader>

      <>
        {apiList &&
          apiList.business_lines &&
          apiList.business_lines.map((linea) => (
            <MenuLink
              key={linea.business_line_name}
              to={`/apis/${linea.business_line_name}`}
              active={business_line === linea.business_line_name ? true : false}
            >
              <h3>
                {linea.business_line_name}
              </h3>
            </MenuLink>
          ))}
      </>
    </Sidebar>
  )
}

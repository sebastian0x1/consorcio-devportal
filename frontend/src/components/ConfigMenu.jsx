import React from 'react'

import Sidebar from './Sidebar/Sidebar'
import SidebarHeader from './Sidebar/SidebarHeader'
import MenuLink from './MenuLink'

const MENU_DATA = [
  {
    key: 'stages',
    module_name: 'stages',
    title: 'ABM Versiones',
    permission: 'ABM_VERSIONES',
  },
  {
    key: 'apis',
    module_name: 'apis',
    title: 'ABM APIs',
    permission: 'ABM_APIS',
  },
  {
    key: 'business-line',
    module_name: 'business-line',
    title: 'ABM Línea de Negocios',
    permission: 'ABM_LINEAS_DE_NEGOCIOS',
  },
  {
    key: 'roles',
    module_name: 'roles',
    title: 'ABM Roles',
    permission: 'ABM_ROLES',
  },
  {
    key: 'users',
    module_name: 'users',
    title: 'ABM Usuarios',
    permission: 'ABM_USUARIOS',
  },
]

export default function ConfigMenu({ module, setModule, hasPermission }) {
  return (
    <Sidebar>
      <SidebarHeader style={{ fontWeight: '400', fontSize: '1.5em' }}>Menu de Configuración</SidebarHeader>
      <br />
      <>
        {MENU_DATA.map(
          ({ key, module_name, title, permission }) =>
            hasPermission(permission) && (
              <MenuLink key={key} active={module === key} onClick={() => setModule(module_name)} to={null}>
                {title}
              </MenuLink>
            )
        )}
      </>
    </Sidebar>
  )
}

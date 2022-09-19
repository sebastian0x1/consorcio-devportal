import React, { useEffect, useState } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from "react-redux"

import PageWithSidebar from '../components/PageWithSidebar'
import ConfigMenu from '../components/ConfigMenu'
import AbmUsers from '../components/Admin/Users/AbmUsers'
import AbmBusinessLines from '../components/Admin/BusinessLines/AbmBusinessLines'
import AbmRoles from '../components/Admin/Roles/AbmRoles'
import AbmApis from '../components/Admin/Apis/AbmApis'
import AbmStages from '../components/Admin/Stages/AbmStages'

import { PERMISSION_TYPES, MAP_MODULE_WITH_PERMISSION } from '../services/self'


function Configuration({
  userPermissions,
}) {
  const [module, setModule] = useState('');

  useEffect( () => {
    if(!module && userPermissions) setModule(MAP_MODULE_WITH_PERMISSION[userPermissions[0]]);
  }, [userPermissions])

  function hasPermission(permType) {
    return userPermissions && userPermissions.includes(permType);
  }

  return (
    <PageWithSidebar
      sidebarContent={<ConfigMenu module={module} setModule={setModule} hasPermission={hasPermission} />}
      SidebarPusherProps={{ className: 'swagger-section' }}
    >
      <div className="config-ui-wrap" style={{ padding: '0 1.25rem' }}>
        <Container style={{ paddingTop: 30, width: "100%" }}>
          {hasPermission(PERMISSION_TYPES.PERMISSION_ABM_USERS) && module === 'users' && <AbmUsers />}
          {hasPermission(PERMISSION_TYPES.PERMISSION_ABM_BUSINESS_LINES) && module === 'business-line' && <AbmBusinessLines />}
          {hasPermission(PERMISSION_TYPES.PERMISSION_ABM_ROLES) && module === 'roles' && <AbmRoles />}
          {hasPermission(PERMISSION_TYPES.PERMISSION_ABM_APIS) && module === 'apis' && <AbmApis />}
          {hasPermission(PERMISSION_TYPES.PERMISSION_ABM_STAGES) && module === 'stages' && <AbmStages />}
        </Container>
      </div>
    </PageWithSidebar>
  )
}

function mapState(state){
  return {
    userPermissions: state.auth.userPermissions,
  }
}

const ConfigurationWrapped = connect(
  mapState,
  null
)(Configuration);

export default ConfigurationWrapped

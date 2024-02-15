import { Routes, Route, Navigate } from 'react-router-dom'

import NavBar from '../components/NavBar'
import Apis from '../pages/Apis'
import ChangePassword from '../pages/ChangePassword'
import Configuration from '../pages/Configuration'
import AdminRoute from './AdminRouter'
import { Loader } from 'semantic-ui-react'
  export default function PrivateRouter({isLogged, isAdmin}) {
    if (isLogged === undefined || isAdmin === undefined){
      return <Loader active content="Cargando..." size="massive" />
    }
    return (
      !isLogged ?
      <Navigate to="/login"/> :
      <>
        <NavBar/>
        <Routes>
            <Route exact path="/apis" element={<Apis />} />
            <Route exact path='/apis/:business_line' element={<Apis />} />
            <Route exact path='/apis/:business_line/:apiId/:tag_account_name/:stage' element={<Apis />} />
            <Route exact path='/changepassword/:email' element={<ChangePassword />} />
            <Route exact path="/config" element={<AdminRoute isAdmin={isAdmin} />}>
                <Route exact path="/config" element={<Configuration />} />
                <Route exact path="/config/:module" element={<Configuration />} />
            </Route>
            <Route exact path="/" element={<Apis />} />
        </Routes>
      </>
    )
}

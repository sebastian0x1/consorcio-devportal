import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Login from './pages/Login'
import LoginAD from './pages/LoginAD'
import VerificationCode from './pages/VerificationCode'
import RecoveryPassword from './pages/RecoveryPassword'

// Components
import { init } from './services/self'

// Redux
import { connect, Provider } from 'react-redux'
import { store } from './reducers/index'

// .css
import 'semantic-ui-css/semantic.css'
import './index.css'

import PrivateRouter from './routers/PrivateRouter'

const versionPj = process.env.REACT_APP_VERSION

function App({ isLogged, isAdmin }) {
  useEffect(() => init(), [])

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={!isLogged ? <Login /> : <Navigate to="/apis" />} />
        <Route exact path="/loginAD" element={!isLogged ? <LoginAD /> : <Navigate to="/apis" />} />
        <Route exact path="/recoverypassword" element={!isLogged ? <RecoveryPassword /> : <Navigate to="/apis" />} />
        <Route exact path="/recoverypassword/:email" element={!isLogged ? <RecoveryPassword /> : <Navigate to="/apis" />} />
        <Route exact path="/verification/" element={!isLogged ? <VerificationCode /> : <Navigate to="/apis" />} />
        <Route exact path="/verification/:email" element={!isLogged ? <VerificationCode /> : <Navigate to="/apis" />} />

        <Route
          path="/*"
          element={
            <PrivateRouter
              isLogged={isLogged}
              isAdmin={isAdmin} />
          }>
        </Route>

        <Route element={() => <h2>Página no encontrada</h2>} />
      </Routes>
      <div id="versionPj">{versionPj}</div>
    </BrowserRouter>
  )
}

// Mapeo los datos que necesito del store
function mapState(state) {
  return {
    isLogged: state.auth.isLogged,
    isAdmin: state.auth.isAdmin,
  }
}

const actionCreators = {}

// Conecto la App con el store
const ConnectedApp = connect(mapState, actionCreators)(App)

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
)

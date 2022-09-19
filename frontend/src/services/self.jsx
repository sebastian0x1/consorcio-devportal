import jwt_decode from 'jwt-decode'

import { store } from '../reducers/index'
import { loginSuccess, loginFailed } from '../reducers/auth'


// Variables
//let logoutTimer;

// Exported Constants
export const STORAGE_ID_TOKEN_KEY = 'us-east-1_kKHvtL3Qy';
export const STORAGE_ACCESS_TOKEN_KEY = 'us-east-2_aKHvtL1Qz';
export const STORAGE_REFRESH_TOKEN_KEY = 'us-east-3_kJHvtL2Qz';
export const PERMISSION_TYPES = {
  PERMISSION_ABM_ROLES: "ABM_ROLES",
  PERMISSION_ABM_USERS: "ABM_USUARIOS",
  PERMISSION_ABM_BUSINESS_LINES: "ABM_LINEAS_DE_NEGOCIOS",
  PERMISSION_ABM_APIS: "ABM_APIS",
  PERMISSION_ABM_STAGES: "ABM_VERSIONES",
};
export const MAP_MODULE_WITH_PERMISSION = {
  [PERMISSION_TYPES.PERMISSION_ABM_ROLES]: "roles",
  [PERMISSION_TYPES.PERMISSION_ABM_USERS]: "users",
  [PERMISSION_TYPES.PERMISSION_ABM_BUSINESS_LINES]: "business-line",
  [PERMISSION_TYPES.PERMISSION_ABM_APIS]: "apis",
  [PERMISSION_TYPES.PERMISSION_ABM_STAGES]: "stages",
};


// Exported Functions
export function init() {

  // Read localStorage
  let idToken = localStorage.getItem(STORAGE_ID_TOKEN_KEY)
  let accessToken = localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY)
  let refreshToken = localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)

  // Login Success
  if(idToken)
    store.dispatch(loginSuccess({ idToken: idToken, accessToken: accessToken, refreshToken: refreshToken }))
  else
    logout()
}

export function login({ idToken, accessToken, refreshToken, userRole, userPermissions }) {
  // console.log('login idToken', idToken)
  // console.log('login accessToken', accessToken)
  // console.log('login refreshToken', refreshToken)
  // console.log('user_permissions', userPermissions)
  // console.log('user_role', userRole)

  // Login Success
  store.dispatch(loginSuccess({ idToken: idToken, accessToken: accessToken, refreshToken: refreshToken, idRole: userRole, userPermissions: userPermissions}))
  // console.log('login store', store)

  // Set item in localStorage
  localStorage.setItem(STORAGE_ID_TOKEN_KEY, idToken)
  localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken)
  // console.log('STORAGE_ID_TOKEN_KEY', STORAGE_ID_TOKEN_KEY, ' => ', idToken)
  // console.log('STORAGE_ACCESS_TOKEN_KEY', STORAGE_ACCESS_TOKEN_KEY, ' => ', accessToken)
  // console.log('STORAGE_REFRESH_TOKEN_KEY', STORAGE_REFRESH_TOKEN_KEY, ' => ', refreshToken)
}

export function logout() {
  // Login Failed
  store.dispatch(loginFailed())

  // Clear timeout
  //clearTimeout(logoutTimer);
  //logoutTimer = undefined;
  
  localStorage.clear();

  if(
    window.location.pathname.indexOf("/recoverypassword") !== -1 ||
    window.location.pathname.indexOf("/verification") !== -1 ||
    window.location.pathname.indexOf("/loginAD") !== -1 
  ) return;
  
  if( window.location.pathname !== "/login" ) window.location = "/login";
}

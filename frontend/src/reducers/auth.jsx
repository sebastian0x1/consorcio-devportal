import { createSlice } from "@reduxjs/toolkit"
import jwt_decode from 'jwt-decode'
import { PERMISSION_TYPES } from '../services/self'

const STORAGE_PERMISSIONS = 'userPermissions'
const STORAGE_ID_ROLE = 'idRole'

// Auth initial state
const AUTH_STATE_INITIAL = {
    apiKey: undefined,
    accessToken: undefined,
    idCognito: undefined,
    idToken: undefined,
    refreshToken: undefined,
    email: undefined,
    idRole: undefined,
    userPermissions: undefined,
    isAdmin: false,
    isLogged: false,
    ssoClientSecret: undefined,
    ssoClientID: undefined,
    ssoUsername: undefined,
    ssoPassword: undefined,
};

function hasPermission(userPermissions,permType) {
    return userPermissions && userPermissions.includes(permType);
}

// Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState: AUTH_STATE_INITIAL,
    reducers: {
        loginSuccess: (state, action) => {
            state.idToken = action.payload.idToken
            state.refreshToken = action.payload.refreshToken
            state.accessToken = action.payload.accessToken
            
            let jwtDecoded = jwt_decode(state.idToken)
            // console.log('jwtDecoded: ', jwtDecoded) //TODO BORRAR

            let group = jwtDecoded['cognito:groups']?.shift()
            // console.log('group', group)

            if(group?.includes("AzureAD")){
                state.isADUser = true
                state.email = jwtDecoded['cognito:username']
                state.ADUsername = state.email
                state.idCognito = state.email
            }else{
                state.isADUser = false
                state.email = jwtDecoded['email']
                state.idCognito = jwtDecoded['sub']
            }

            state.apiKey = jwtDecoded['custom:api_key']

            try {
                // console.log('action.payload.idRole', action.payload.idRole)
                // console.log('action.payload.userPermissions', action.payload.userPermissions)
                state.idRole = jwtDecoded['custom:role_id']
                state.userPermissions = jwtDecoded['custom:user_permissions'].split(',') || []
            } catch(e) {
                state.userPermissions = []
                state.idRole = ''
            }
            // console.log('state.userPermissions dsp', state.userPermissions)
            // console.log('state.idRole dsp ', state.idRole)
            
            // console.log('state.isADUser', state.isADUser)
            state.isAdmin = (state.idRole == 2)
            /*(
                hasPermission(state.userPermissions,PERMISSION_TYPES.PERMISSION_ABM_USERS) |
                hasPermission(state.userPermissions,PERMISSION_TYPES.PERMISSION_ABM_APIS) |
                hasPermission(state.userPermissions,PERMISSION_TYPES.PERMISSION_ABM_BUSINESS_LINES) |
                hasPermission(state.userPermissions,PERMISSION_TYPES.PERMISSION_ABM_STAGES) |
                hasPermission(state.userPermissions,PERMISSION_TYPES.PERMISSION_ABM_ROLES)
            ))*/
            state.isLogged = true

            state.ssoClientSecret = jwtDecoded["custom:ssoClientSecret"]
            state.ssoClientID = jwtDecoded["custom:ssoClientID"]
            state.ssoUsername = jwtDecoded["custom:ssoUsername"]
            state.ssoPassword = jwtDecoded["custom:ssoPassword"]
            state.realm = jwtDecoded["custom:realm"]
            state.grantType = jwtDecoded["custom:grantType"]
        },
        loginFailed: (state, action) => {
            state = AUTH_STATE_INITIAL
        }
    },
});

function storageValue(initializeState, storageState){    
    if((storageState === 'idRole' && initializeState !== undefined) || (storageState === 'userPermissions' && initializeState.length)){
        let valueAction = initializeState
        if(valueAction){
            localStorage.setItem(storageState, btoa(valueAction))
            return valueAction
        }
    } else {
        let valueStorage = localStorage.getItem(storageState)
        if(valueStorage)
        return atob(valueStorage)  
    }
    return ''
}

// Extract and export each action creator by name
export const { loginSuccess, loginFailed } = authSlice.actions;
// Export the reducer, either as a default or named export
export const authReducer = authSlice.reducer;
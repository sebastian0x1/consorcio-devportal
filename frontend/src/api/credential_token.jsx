import axiosApiInstance from './axios'
import { makeHash } from '../utils/hashing'

const API_CREDENTIAL_TOKEN = {
    getSSOToken: async (is_mock, credentialsData) => {
        if (is_mock) {
            return {
                status: 200,
                data: {
                    token_type: "token_type",
                    access_token: "access_token",
                }
            }
        }

        let data = makeHash(
            JSON.stringify({
                // grant_type: 'password',
                ...credentialsData,
            })
            )
        // console.log('getSSOToken -> datamakehash', data)
        return axiosApiInstance.post(`/credentials`, { data } )
    },
    setSSOToken: async (is_mock, idCognito, credentialsData) => {
        if (is_mock) {
            return { status: 204 }
        }

        let data = makeHash(JSON.stringify(credentialsData))
        return axiosApiInstance.put(`/credentials/${idCognito}`, { data } )
    },
}

export default API_CREDENTIAL_TOKEN

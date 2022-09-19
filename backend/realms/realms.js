const realms_dev = [
    {
        'realm_name': 'SSOConsorcioClientes',
        'realm_endpoint': 'https://ssodev.cnsv.cl/auth/realms/SSOConsorcioClientes/protocol/openid-connect/token'
    },
    {
        'realm_name': 'Inversiones',
        'realm_endpoint': 'https://ssodev.cnsv.cl/auth/realms/Inversiones/protocol/openid-connect/token'
    },
    {
        'realm_name': 'CRM',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/ERP/protocol/openid-connect/token'
    },
    {
        'realm_name': 'ERP',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/CRM/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioMFA',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SsoConsorcioMFA/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SSOAzureAD',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SSOAzureAD/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SSOConsorcioLiferay',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SSOConsorcioLiferay/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SitioClienteDistribuidor',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SitioClienteDistribuidor/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioIPA',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SsoConsorcioIPA/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioAD',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SsoConsorcioAD/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioClientesDigitales',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SsoConsorcioClientesDigitales/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioServicios',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SsoConsorcioServicios/protocol/openid-connect/token'
    },
    {
        'realm_name': 'master',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/master/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoPortalPagos',
        'realm_endpoint': 'https://ssodev.consorcio.cl/auth/realms/SsoPortalPagos/protocol/openid-connect/token'
    },
]

const realms_qa = [
    {
        'realm_name': 'SSOConsorcioClientes',
        'realm_endpoint': 'https://ssoqa.cnsv.cl/auth/realms/SSOConsorcioClientes/protocol/openid-connect/token'
    },
    {
        'realm_name': 'Inversiones',
        'realm_endpoint': 'https://ssoqa.cnsv.cl/auth/realms/Inversiones/protocol/openid-connect/token'
    },
    {
        'realm_name': 'CRM',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/ERP/protocol/openid-connect/token'
    },
    {
        'realm_name': 'ERP',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/CRM/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioMFA',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SsoConsorcioMFA/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SSOAzureAD',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SSOAzureAD/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SSOConsorcioLiferay',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SSOConsorcioLiferay/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SitioClienteDistribuidor',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SitioClienteDistribuidor/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioIPA',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SsoConsorcioIPA/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioAD',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SsoConsorcioAD/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioClientesDigitales',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SsoConsorcioClientesDigitales/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoConsorcioServicios',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SsoConsorcioServicios/protocol/openid-connect/token'
    },
    {
        'realm_name': 'master',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/master/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SsoPortalPagos',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SsoPortalPagos/protocol/openid-connect/token'
    },
    {
        'realm_name': 'SSOConsorcioIAM',
        'realm_endpoint': 'https://ssoqa.consorcio.cl/auth/realms/SSOConsorcioIAM/protocol/openid-connect/token'
    },
]

module.exports = {
    realms_dev,
    realms_qa
}
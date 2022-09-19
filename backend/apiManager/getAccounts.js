const AWS = require('aws-sdk')
// const SSM = require('aws-sdk/clients/ssm')

const tagPortalIdentifier = ['dev', 'test', 'prod'] //'CNTV.Chile' // TODO: estandarizar el valor del tag para identificar las cuentas miembros
const tagPortalKey = 'ambiente'

const getPortalMembersAccounts = async () => {
  console.log('getAccounts.js - getPortalMembersAccounts')
  const accountFromOrganization = await getAccountsFromOrganization()
  console.log('getAccounts.js - getPortalMembersAccounts => accountFromOrganization:', accountFromOrganization)

  let portalMembersAccount = []
  const accountsTags = []
  const organizations = new AWS.Organizations({ region: process.env.REGION })

  for (const account of accountFromOrganization) {
    let params = {
      ResourceId: account.Id,
    }
    console.log('getAccounts.js - getPortalMembersAccounts => Antes de listTagsForResource')
    try {
      let accountDescription = await organizations.listTagsForResource(params).promise()
      console.log('getAccounts.js - getPortalMembersAccounts => accountDescription: ', accountDescription)
      const tag = accountDescription.Tags.find(
        (element) => element.Key === tagPortalKey && tagPortalIdentifier.includes(element.Value)
      )
      console.log('getAccounts.js - getPortalMembersAccounts => tag: ', tag)
      if (tag) {
        portalMembersAccount.push(account)
        accountsTags.push({ accountId: account.Id, tag: tag.Value })
      }
    } catch (error) {
      console.log('No se pudo analizar la cuenta => ', account.Id, '\nerror => ', error)
    }
  }
  // portalMembersAccount.push(process.env.AWS_ACCOUNT_ID)
  console.log('getAccounts.js - getPortalMembersAccounts => portalMembersAccount', portalMembersAccount)
  await insertAccountTagIntoDb(accountsTags)
  return portalMembersAccount
}

// FUNCIÓN QUE UTILIZA PARAMETERS STORE
// const getAccountsFromOrganization = async () => {
//   console.log('getAccounts.js - getAccountsFromOrganization')

//   const ssm = new SSM()

//   let accountsOrgArray = []

//   accountsOrgArray = await ssm
//     .describeParameters((err, data) => {
//       return data
//     })
//     .promise()
//     .then((data) => {
//       return data.Parameters
//     })
//   console.log('accountsOrgArray', accountsOrgArray)

//   // Obtengo los nombres de los Parameters necesarios para el método getParameters()
//   const accountsNamesArr = []
//   for (const iterator of data['Parameters']) {
//     accountsNamesArr.push(iterator.Name)
//   }
//   console.log('accountsNamesArr', accountsNamesArr)

//   // Obtengo un listado de objetos que contienen Name, Value y ARN del Parameter
//   const accountsValuesArr = await ssm
//     .getParameters({ Names: accountsNamesArr })
//     .promise()
//     .then((data) => {
//       return data.Parameters
//     })
//   console.log('accountsValuesArr', accountsValuesArr)

//   console.log('getAccounts.js - getAccountsFromOrganization => accountsValuesArr', accountsValuesArr.length)
//   return accountsValuesArr
// }

// MÉTODO QUE LISTA LAS CUENTAS DE LA ORGANIZACION CON listAccounts()
// const getAccountsFromOrganization = async () => {
//   console.log('getAccounts.js - getAccountsFromOrganization')
//   var organizations = new AWS.Organizations({ region: process.env.REGION })

//   let accountsOrgArray = []

//   let params = {
//     NextToken: undefined,
//     ParentId: process.env.PARENT_ACCOUNT_ID,
//   }

//   // accountsOrgArray = await organizations.listAccounts(params).promise()
//   accountsOrgArray = await organizations.listAccountsForParent(params).promise()

//   params.NextToken = accountsOrgArray?.NextToken
//   accountsOrgArray = accountsOrgArray.Accounts ? accountsOrgArray.Accounts : null
//   //console.log('getRestApis.js - getAccountsFromOrganization => Next Token', params.NextToken)

//   let accountsOrgArrayPart
//   while (params.NextToken) {
//     // accountsOrgArrayPart = await organizations.listAccounts(params).promise()
//     accountsOrgArrayPart = await organizations.listAccountsForParent(params).promise()
//     accountsOrgArray.push(...accountsOrgArrayPart.Accounts)
//     params.NextToken = accountsOrgArrayPart?.NextToken
//     //console.log('getRestApis.js - getAccountsFromOrganization => Next Token', params.NextToken)
//   }

//   console.log('getAccounts.js - getAccountsFromOrganization => accountsOrgArray', accountsOrgArray.length)
//   return accountsOrgArray
// }

const getAccountsFromOrganization = async () => {
  const organizations = new AWS.Organizations({ region: process.env.region })
  const ouArray = await getAllOU()
  let arrayAccounts = []
  for (const ou of ouArray.OrganizationalUnits) {
    var params = {
      ParentId: ou.Id,
    }
    let accounts = await organizations.listAccountsForParent(params).promise()
    if (accounts['Accounts'].length > 0) {
      arrayAccounts.push(...accounts['Accounts'])
    }
  }
  return arrayAccounts
}

const getAllOU = async () => {
  const organizations = new AWS.Organizations({ region: process.env.region })
  var params = {
    ParentId: process.env.PARENT_ACCOUNT_ID,
  }
  return await organizations.listOrganizationalUnitsForParent(params).promise()
}

const insertAccountTagIntoDb = async (accountsTags) => {
  console.log('getAccounts.js - insertAccountTagIntoDb => accountsTags: ', accountsTags)
  if (accountsTags && accountsTags.length > 0) {
    const dbConnection = require('../utils/dbConnection')

    const db = await dbConnection.connect()

    try {
      await db
        .transaction()
        .query(() => {
          return [`SELECT tag_id, tag_name FROM tags`]
        })
        .query((tagsInfo) => {
          console.log('tagsInfo', tagsInfo)

          let insertData = accountsTags.map((account) => [account.accountId, account.tag, 'grey'])
          console.log('getAccounts.js - insertAccountTagIntoDb => insertData: ', insertData)

          insertData.map((tag_account) => {
            const replaceValue = tagsInfo.find((tag) => {
              return tag.tag_name == tag_account[1]
            })
            tag_account[1] = replaceValue.tag_id
          })

          return [`INSERT IGNORE INTO tag_accounts (tag_account, tag_account_name, tag_account_color) VALUES ?`, [insertData]]
        })
        .commit()
    } catch (error) {
      console.log(error)
    } finally {
      db.quit()
    }
  } else {
    console.log('getAccounts.js - insertAccountTagIntoDb => No data to insert')
  }
}

module.exports = {
  getPortalMembersAccounts,
  getAccountsFromOrganization,
}

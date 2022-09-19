const CryptoJS = require('crypto-js')

export function makeHash(str) {
  return CryptoJS.AES.encrypt(str, process.env.REACT_APP_ENCRYPTION_PASSWORD).toString()
}

export function unHash(encStr) {
  let decrypted = CryptoJS.AES.decrypt(encStr, process.env.REACT_APP_ENCRYPTION_PASSWORD)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

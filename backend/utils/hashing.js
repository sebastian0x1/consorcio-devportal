const CryptoJS = require('crypto-js')

function makeHash(str) {
  return CryptoJS.AES.encrypt(str, process.env.ENCRYPTION_PASSWORD).toString()
}

function unHash(encStr) {
  let decrypted = CryptoJS.AES.decrypt(encStr, process.env.ENCRYPTION_PASSWORD)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

module.exports = {
  makeHash,
  unHash,
}

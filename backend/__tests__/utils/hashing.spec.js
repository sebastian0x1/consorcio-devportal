require('dotenv').config()
const { makeHash, unHash } = require('../../utils/hashing')

describe('hash-unhash', () => {
  let word = 'demi'
  test('hash-unhash', async () => {
    expect(unHash(makeHash(word))).toBe(word)
  })
  test('si falla esta mal', async () => {
    expect(unHash(makeHash(word))).not.toBe('word')
  })
  test('si falla esta mal', async () => {
    expect(unHash(makeHash(word))).not.toBe('')
  })
})

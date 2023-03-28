import chai from 'chai'
import { describe } from 'mocha'

import { aes, v1, v2 } from '../src/safeV2'
import * as rsa from '../src/safeV2/rsa'
import * as chacha from '../src/safeV2/chacha'

import { ALICE, RAWKEY } from './fixtures/configs'
import chaiAsPromised from 'chai-as-promised'
import { AES_PWD, AES_SALT, BIG_JSON } from './fixtures/safe'

chai.use(chaiAsPromised)
const { expect } = chai

describe('Safe testing', () => {
  describe('V1 Testing', () => {
    it('V1::encrypt', function () {
      const encrypted = v1.encrypt(
        RAWKEY,
        ALICE.password,
        ALICE.salt
      )
      expect(encrypted).to.deep.equal(ALICE.key)
    })
    it('V1::decrypt', function () {
      const decrypted = v1.decrypt(
        ALICE.key,
        ALICE.password,
        ALICE.salt
      )
      expect(decrypted).to.deep.equal(RAWKEY)
    })
  })

  describe('V2 Testing', () => {
    it('AES testing', async function () {
      const plain = 'Hello World'
      const encoded = aes.encrypt(plain, AES_PWD, AES_SALT)
      expect(aes.decrypt(encoded, AES_PWD, AES_SALT)).to.deep.equal(plain)
    })
    it('RSA testing', async function () {
      const key = await rsa.genKeyPair()
      expect(key).to.be.ok

      const plain = 'Hello World'
      const encoded = rsa.encrypt(key.publicKey, plain)
      expect(rsa.decrypt(key.privateKey, encoded)).to.deep.equal(plain)
    })

    it('Chacha testing', () => {
      const plainText = 'Hello world'

      const { keyBytes, b64DataBytes } = chacha.encrypt(plainText)
      const decrypted = chacha.decrypt(keyBytes, b64DataBytes)
      expect(decrypted).to.deep.equal(plainText)
    })
    it('Enc/Dec testing', async function () {
      const rsaKey = await rsa.genKeyPair(),
        plain = JSON.stringify(BIG_JSON)

      const encrypted = v2.encrypt(plain, {
        aesPwd: AES_PWD,
        aesSalt: AES_SALT,
        rsaKey: rsaKey.publicKey,
        isPubKey: true,
      })
      const decrypted = v2.decrypt(encrypted, {
        aesPwd: AES_PWD,
        aesSalt: AES_SALT,
        rsaKey: rsaKey.privateKey,
        isPubKey: false,
      })
      expect(decrypted).to.deep.equal(plain)
    })
  })
})

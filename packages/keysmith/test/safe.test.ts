import chai from 'chai'
import { describe } from 'mocha'

import { aes, v1, v2 } from '../src/safe'
import * as rsa from '../src/safe/rsa'
import * as chacha from '../src/safe/chacha'

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
      const encoded = rsa.encrypt(key.publicKey, Buffer.from(plain, 'utf8'))
      expect(rsa.decrypt(key.privateKey, encoded).toString('utf8')).to.deep.equal(plain)
    })

    it('Chacha testing', () => {
      const chachaKey = chacha.genPassword()
      const plainText = 'Hello world'

      const encrypted = chacha.encrypt(chachaKey, Buffer.from(plainText, 'utf8'))
      const decrypted = chacha.decrypt(chachaKey, encrypted)
      expect(decrypted.toString('utf8')).to.deep.equal(plainText)
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

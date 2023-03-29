import _ from 'lodash'
import * as aes from './aes'
import * as rsa from './rsa'
import * as chacha from './chacha'
import { CommData, CommSecret } from '../types'
import { util } from 'node-forge'

export function encrypt(plain: string, commSecret: CommSecret): CommData {
  if (!_.isEmpty(commSecret.aesPwd) && !_.isEmpty(commSecret.aesSalt)) {
    plain = aes.encrypt(
      plain,
      commSecret.aesPwd!,
      commSecret.aesSalt!,
    )
  }

  const { keyBytes, b64DataBytes } = chacha.encrypt(
    util.encodeUtf8(plain),
  )
  const secretBytes = rsa.encrypt(commSecret.rsaKey, keyBytes)
  return {
    data: b64DataBytes,
    secret: util.encode64(secretBytes),
  }
}

export function decrypt(data: CommData, commSecret: CommSecret): string {
  const chachaKey = rsa.decrypt(
    commSecret.rsaKey,
    util.decode64(data.secret),
  )
  const ret = chacha.decrypt(chachaKey, data.data)
  if (_.isEmpty(commSecret.aesPwd) || _.isEmpty(commSecret.aesSalt)) {
    return ret
  }
  return aes.decrypt(ret, commSecret.aesPwd!, commSecret.aesSalt!)
}

export type WalletCipher = (key: string) => string
export function getWalletCiphers(krData): WalletCipher[]  {
  if (_.isEmpty(krData)) {
    throw Error('Wrong KR info!')
  }

  const { key, salt, password } = krData
  const decryptedKey = aes.decrypt(key, password, salt)

  return [
    plainPK => aes.encrypt(plainPK, decryptedKey, salt),
    encryptedPK => aes.decrypt(encryptedPK, decryptedKey, salt),
  ]
}

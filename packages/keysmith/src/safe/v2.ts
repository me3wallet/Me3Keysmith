import _ from 'lodash'
import { randomBytes } from 'crypto'
import * as aes from './aes'
import * as rsa from './rsa'
import * as chacha from './chacha'
import { CommData, CommSecret } from '../types'

export function encrypt(plain: string, commSecret: CommSecret): CommData {
  if (!_.isEmpty(commSecret.aesPwd) && !_.isEmpty(commSecret.aesSalt)) {
    plain = aes.encrypt(
      plain,
      commSecret.aesPwd!,
      commSecret.aesSalt!
    )
  }

  const chachaKey = randomBytes(32)
  const data = chacha.encrypt(
    chachaKey,
    Buffer.from(plain, 'utf8')
  ).toString('base64')
  const secret = rsa.encrypt(
    commSecret.rsaKey,
    chachaKey,
    commSecret.isPubKey
  ).toString('base64')
  return { data, secret }
}

export function decrypt(data: CommData, commSecret: CommSecret): string {
  const chachaKey = rsa.decrypt(
    commSecret.rsaKey,
    Buffer.from(data.secret, 'base64'),
    commSecret.isPubKey
  )
  const decryped = chacha.decrypt(
    chachaKey,
    Buffer.from(data.data, 'base64')
  )

  const ret = decryped.toString('utf8')
  if (_.isEmpty(commSecret.aesPwd) || _.isEmpty(commSecret.aesSalt)) {
    return ret
  }
  return aes.decrypt(ret, commSecret.aesPwd!, commSecret.aesSalt!)
}

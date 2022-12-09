import _ from 'lodash'
import {randomBytes} from 'crypto'
import * as aes from './aes'
import * as rsa from './rsa'
import * as chacha from './chacha'
import {CommData, CommSecure} from '../config'

export function encrypt(plain: string, commSecure: CommSecure): CommData {
  let retData = Buffer.from(plain, 'utf8')
  if (!_.isEmpty(commSecure.aesPwd) && !_.isEmpty(commSecure.aesSalt)) {
    retData = aes.encrypt(
      plain,
      commSecure.aesPwd!,
      commSecure.aesSalt!
    )
  }

  const chachaKey = randomBytes(32)
  const data = chacha.encrypt(chachaKey, retData).toString('base64')
  const secret = rsa.encrypt(
    commSecure.rsaKey,
    chachaKey,
    commSecure.isPubKey
  ).toString('base64')
  return {data, secret}
}

export function decrypt(data: CommData, commSecure: CommSecure): string {
  const chachaKey = rsa.decrypt(
    commSecure.rsaKey,
    Buffer.from(data.secret, 'base64'),
    commSecure.isPubKey
  )
  const decryped = chacha.decrypt(
    chachaKey,
    Buffer.from(data.data, 'base64')
  )
  if (_.isEmpty(commSecure.aesPwd) || _.isEmpty(commSecure.aesSalt)) {
    return decryped.toString('utf8')
  }
  return aes.decrypt(
    decryped,
    commSecure.aesPwd!,
    commSecure.aesSalt!
  )
}

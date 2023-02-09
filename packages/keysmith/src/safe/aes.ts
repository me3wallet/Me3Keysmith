import _ from 'lodash'
import { createCipheriv, createDecipheriv, pbkdf2Sync } from 'crypto'

const ENC_ALGO = 256
const KEY_SIZE = ENC_ALGO / 8
const IV_SIZE = 128 / 8

export function encrypt(plain: string, password: string, salt: string): string {
  const key = pbkdf2Sync(password, salt, 1, KEY_SIZE, 'sha512')
  const iv = pbkdf2Sync(password, salt, 1, IV_SIZE, 'sha512')

  const cipher = createCipheriv(`aes-${ENC_ALGO}-cbc`, key, iv)
  cipher.setAutoPadding(false)
  const encrypted = Buffer.concat([
    cipher.update(_paddingSpace(plain), 'utf8'),
    cipher.final(),
  ]).toString('hex')
  return Buffer.from(encrypted, 'utf8')
    .toString('base64')
}

export function decrypt(b64Str: string, password: string, salt: string): string {
  const key = pbkdf2Sync(password, salt, 1, KEY_SIZE, 'sha512')
  const iv = pbkdf2Sync(password, salt, 1, IV_SIZE, 'sha512')

  const utf8 = Buffer.from(b64Str, 'base64').toString('utf8')
  const decipher = createDecipheriv(`aes-${ENC_ALGO}-cbc`, key, iv)
  decipher.setAutoPadding(false)
  const decoded = Buffer.concat([
    decipher.update(utf8, 'hex'),
    decipher.final(),
  ]).toString('utf8')
  return _.trimEnd(decoded, ' ')
}

function _paddingSpace(str: string, pad = 16) {
  const paddedLen = str.length + pad - (str.length % pad)
  return _.padEnd(str, paddedLen)
}

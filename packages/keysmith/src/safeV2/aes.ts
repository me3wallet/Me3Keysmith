import _ from 'lodash'
import { cipher, pbkdf2, util } from 'node-forge'

const KEY_SIZE = 256 / 8
const IV_SIZE = 128 / 8

export function encrypt(plain: string, password: string, salt: string): string {
  const key = pbkdf2(password, salt, 1, KEY_SIZE, 'sha512')
  const iv = pbkdf2(password, salt, 1, IV_SIZE, 'sha512')

  const engine = cipher.createCipher('AES-CBC', key)
  engine.mode.pad = undefined
  engine.mode.unpad = undefined

  engine.start({ iv })
  engine.update(util.createBuffer(
    _paddingSpace(plain),
    'utf8',
  ))
  engine.finish()

  return util.encode64(
    util.encodeUtf8(
      engine.output.toHex(),
    ),
  )
}

export function decrypt(b64Str: string, password: string, salt: string): string {
  const rawBytes = util.hexToBytes(
    util.decodeUtf8(
      util.decode64(b64Str),
    ),
  )

  const key = pbkdf2(password, salt, 1, KEY_SIZE, 'sha512')
  const iv = pbkdf2(password, salt, 1, IV_SIZE, 'sha512')
  const engine = cipher.createDecipher('AES-CBC', key)
  engine.mode.pad = undefined
  engine.mode.unpad = undefined

  engine.start({ iv })
  engine.update(util.createBuffer(rawBytes))
  engine.finish()

  return _.trimEnd(
    util.decodeUtf8(engine.output),
    ' ',
  )
}

function _paddingSpace(str: string, pad = 16) {
  const paddedLen = str.length + pad - (str.length % pad)
  return _.padEnd(str, paddedLen)
}


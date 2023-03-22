import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  KeyObject,
  privateDecrypt,
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
} from 'crypto'

import { RsaKey } from '../types'

export async function genKeyPair(): Promise<RsaKey> {
  const { publicKey, privateKey } = await generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicExponent: 0x10001,
    publicKeyEncoding: {
      format: 'der',
      type: 'spki',
    },
    privateKeyEncoding: {
      format: 'der',
      type: 'pkcs8',
    },
  })
  return {
    privateKey: privateKey.toString('base64'),
    publicKey: publicKey.toString('base64'),
  }
}

export function encrypt(b64Key: string, plain: Buffer, isPubKey = true): Buffer {
  const keyObj = _b642RsaKey(b64Key, isPubKey)
  return isPubKey
    ? publicEncrypt(keyObj, plain)
    : privateEncrypt(keyObj, plain)
}

export function decrypt(b64Key: string, encrypted: Buffer, isPubKey = false): Buffer {
  const keyObj = _b642RsaKey(b64Key, isPubKey)
  return isPubKey
    ? publicDecrypt(keyObj, encrypted)
    : privateDecrypt(keyObj, encrypted)
}

function _b642RsaKey(b64Str: string, isPubKey = true): KeyObject {
  const buf = Buffer.from(b64Str, 'base64')

  return isPubKey
    ? createPublicKey({
      key: buf,
      format: 'der',
      type: 'spki',
    })
    : createPrivateKey({
      key: buf,
      format: 'der',
      type: 'pkcs8',
    })
}

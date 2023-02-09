import crypto, { randomBytes } from 'crypto'

const ALGO_NAME = 'chacha20-poly1305'
const AUTHTAG_LEN = 16
const NONCE_LEN = 12

export function genPassword(): Buffer {
  return randomBytes(32)
}

export function encrypt(key: Buffer, plain: Buffer): Buffer {
  const nonce = randomBytes(NONCE_LEN)
  const cipher = crypto.createCipheriv(ALGO_NAME, key, nonce, {
    authTagLength: AUTHTAG_LEN,
  })
  return Buffer.concat([
    //---Nonce---
    nonce,
    //---Ciper texts---
    cipher.update(plain),
    cipher.final(),
    //---Auth Tag---
    cipher.getAuthTag(),
  ])
}

export function decrypt(key: Buffer, encrypted: Buffer): Buffer {
  const nonce = encrypted.subarray(0, NONCE_LEN)
  const decipher = crypto.createDecipheriv(ALGO_NAME, key, nonce, {
    authTagLength: AUTHTAG_LEN,
  })
  decipher.setAuthTag(encrypted.subarray(-AUTHTAG_LEN))
  return Buffer.concat([
    decipher.update(encrypted.subarray(
      NONCE_LEN,
      -AUTHTAG_LEN
    )),
    decipher.final(),
  ])
}

import { ChaCha20Poly1305, KEY_LENGTH, NONCE_LENGTH } from '@stablelib/chacha20poly1305'
import { concat } from '@stablelib/bytes'
import { random, util } from 'node-forge'

import { forgeBytes2Uint8Array, uint8Array2ForgeBytes } from './common'

export function encrypt(utf8PlainBytes: string): { keyBytes: string, b64DataBytes: string } {
  const keyBytes = random.getBytesSync(KEY_LENGTH)
  const dataArray = forgeBytes2Uint8Array(
    util.encodeUtf8(utf8PlainBytes),
  )

  const cipher = new ChaCha20Poly1305(
    forgeBytes2Uint8Array(keyBytes),
  )
  const nonceArray = forgeBytes2Uint8Array(
    random.getBytesSync(NONCE_LENGTH),
  )
  const encrypted = cipher.seal(nonceArray, dataArray)
  const forgeBytes = uint8Array2ForgeBytes(
    concat(nonceArray, encrypted),
  )

  const dataBytes = util.encode64(forgeBytes)
  return { keyBytes, b64DataBytes: dataBytes }
}

export function decrypt(keyBytes: string, encryptedBytes: string): string {
  const decipher = new ChaCha20Poly1305(
    forgeBytes2Uint8Array(keyBytes),
  )
  const encryptedArray = forgeBytes2Uint8Array(
    util.decode64(encryptedBytes),
  )
  const decrypted = decipher.open(
    encryptedArray.slice(0, NONCE_LENGTH),
    encryptedArray.slice(NONCE_LENGTH),
  )
  return util.decodeUtf8(
    uint8Array2ForgeBytes(decrypted),
  )
}

import { asn1, md, pki, util } from 'node-forge'
import { RsaKey } from '../types'

function _b64DerStr2Key(b64DerStr, isPriKey = true) {
  const asn1Obj = asn1.fromDer(util.decode64(b64DerStr))
  return isPriKey === true
    ? pki.privateKeyFromAsn1(asn1Obj)
    : pki.publicKeyFromAsn1(asn1Obj)
}

function _key2B64DerStr(key, isPriKey = true): string {
  const asn1Obj =
    isPriKey === true ? pki.privateKeyToAsn1(key) : pki.publicKeyToAsn1(key)
  const derFmt = asn1.toDer(asn1Obj).getBytes()
  return util.encode64(derFmt)
}

export function genKeyPair(): RsaKey {
  const { privateKey, publicKey } = pki.rsa.generateKeyPair({
    bits: 1024,
    e: 0x10001,
  })
  return {
    privateKey: _key2B64DerStr(privateKey, true),
    publicKey: _key2B64DerStr(publicKey, false),
  }
}

/**
 * Encrypt utf8plainBytes using pubKey
 * @param b64Key RSA pub key in Der format
 * @param plainBytes Plain text to encrypt
 * @return Encrypted ForgeByte string
 */
export function encrypt(b64Key: string, plainBytes: string): string {
  const keyObj = _b64DerStr2Key(b64Key, false)
  return keyObj.encrypt(plainBytes, 'RSA-OAEP', {
    md: md.sha1.create(),
    mgf1: {
      md: md.sha1.create(),
    },
  })
}

/**
 * Decrypt plainForgeBytes using pubKey
 * @param b64Key RSA pub key in Der format
 * @param encryptedForgeBytes Plain text to encrypt
 * @return Decrypted ForgeByte string
 */
export function decrypt(b64Key: string, encryptedForgeBytes: string): string {
  const priKey = _b64DerStr2Key(b64Key, true)
  return priKey.decrypt(encryptedForgeBytes, 'RSA-OAEP')
}

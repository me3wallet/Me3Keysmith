import {
  createPrivateKey,
  createPublicKey,
  KeyObject,
  privateDecrypt,
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
  subtle
} from "crypto";
import {RsaKey} from "../config";

export async function genKeyPair(): Promise<RsaKey> {
  const {publicKey, privateKey} = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 1024,
      publicExponent: Uint8Array.from([0x01, 0x00, 0x01]),
      hash: 'SHA-512',
    },
    true,
    ['encrypt', 'decrypt']
  );

  return {
    privateKey: await _cryptoKey2B64(privateKey, false),
    publicKey: await _cryptoKey2B64(publicKey, true),
  };
}

export function encrypt(b64Key: string, plain: Buffer, isPubKey: boolean = true): Buffer {
  const keyObj = _b642RsaKey(b64Key, isPubKey);
  return isPubKey
    ? publicEncrypt(keyObj, plain)
    : privateEncrypt(keyObj, plain);
}

export function decrypt(b64Key: string, encrypted: Buffer, isPubKey: boolean = false): Buffer {
  const keyObj = _b642RsaKey(b64Key, isPubKey);
  return isPubKey
    ? publicDecrypt(keyObj, encrypted)
    : privateDecrypt(keyObj, encrypted);
}

async function _cryptoKey2B64(cryptoKey: CryptoKey, isPubKey: boolean = true): Promise<string> {
  const arrayBuf = await subtle.exportKey(
    isPubKey ? 'spki' : 'pkcs8',
    cryptoKey
  );
  return Buffer.from(arrayBuf).toString('base64');
}

function _b642RsaKey(b64Str: string, isPubKey: boolean = true): KeyObject {
  const buf = Buffer.from(b64Str, 'base64');

  return isPubKey ? createPublicKey({
      key: buf,
      format: 'der',
      type: 'spki'
    })
    : createPrivateKey({
      key: buf,
      format: 'der',
      type: 'pkcs8',
    });
}

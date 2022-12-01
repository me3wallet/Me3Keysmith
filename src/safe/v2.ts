import _ from 'lodash';
import {createCipheriv, createDecipheriv, pbkdf2Sync, privateDecrypt, publicEncrypt, subtle} from 'crypto';
import {paddingSpace} from './common';
import {RsaKey} from "../config";

const ENC_ALGO = 256
const KEY_SIZE = ENC_ALGO / 8;
const IV_SIZE = 128 / 8;

export default {
  // AES Enc/Dec
  aesEncrypt(str: string, faceId: string, salt: string) {
    const key = pbkdf2Sync(faceId, salt, 1, KEY_SIZE, 'sha512');
    const iv = pbkdf2Sync(faceId, salt, 1, IV_SIZE, 'sha512');

    const cipher = createCipheriv(`aes-${ENC_ALGO}-cbc`, key, iv);
    cipher.setAutoPadding(false);
    const encrypted = cipher.update(
      paddingSpace(str),
      'utf8',
      'hex'
    ) + cipher.final('hex');
    return Buffer.from(encrypted, 'utf8').toString('base64');
  },

  aesDecrypt(str: string, faceId: string, salt: string) {
    const key = pbkdf2Sync(faceId, salt, 1, KEY_SIZE, 'sha512');
    const iv = pbkdf2Sync(faceId, salt, 1, IV_SIZE, 'sha512');

    const base64 = Buffer.from(str, 'base64').toString('utf8');
    const decipher = createDecipheriv(`aes-${ENC_ALGO}-cbc`, key, iv);
    decipher.setAutoPadding(false);
    const decoded = decipher.update(
      base64,
      'hex',
      'utf8'
    ) + decipher.final('utf8');
    return _.trimEnd(decoded, ' ');
  },

  // RSA Enc/Dec
  async rsaKeyPair(): Promise<RsaKey> {
    const {publicKey, privateKey} = await subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 1024,
        publicExponent: Uint8Array.from([0x01, 0x00, 0x01]),
        hash: 'SHA-512',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const pri = await subtle.exportKey(
      'pkcs8',
      privateKey
    );
    const pub = await subtle.exportKey(
      'spki',
      publicKey
    );

    const arrayBuf2Str = (buf: ArrayBuffer) => {
      return Buffer.from(buf).toString('base64')
    }

    return {
      privateKey: arrayBuf2Str(pri),
      publicKey: arrayBuf2Str(pub),
    };
  },
  rsaEncrypt(pubKey: string, plain: string): string {
    const buf = publicEncrypt(
      `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`,
      Buffer.from(plain, 'utf8')
    );
    return buf.toString('base64');
  },

  rsaDecrypt(priKey: string, encrypted: string): string {
    const buf = privateDecrypt(
      `-----BEGIN RSA PRIVATE KEY-----\n${priKey}\n-----END RSA PRIVATE KEY-----`,
      Buffer.from(encrypted, 'base64')
    );
    return buf.toString('utf8');
  },
};

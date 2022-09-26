import _ from "lodash";
import CryptoJS from "crypto-js";

function _paddingSpace(str: string, pad = 16) {
  const paddedLen = str.length + pad - (str.length % pad);
  return _.padEnd(str, paddedLen);
}

export default {
  encrypt(str: string, faceId: string, salt: string) {
    const key = CryptoJS.PBKDF2(faceId, salt, {
      keySize: 256 / 32,
      iterations: 1,
      hasher: CryptoJS.algo.SHA512,
    });
    const iv = CryptoJS.PBKDF2(faceId, salt, {
      keySize: 128 / 32,
      iterations: 1,
      hasher: CryptoJS.algo.SHA512,
    });
    str = _paddingSpace(str);
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(str), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
    }).toString(CryptoJS.format.Hex);

    return CryptoJS.enc.Utf8.parse(encrypted).toString(CryptoJS.enc.Base64);
  },

  decrypt(str: string, faceId: string, salt: string) {
    const key = CryptoJS.PBKDF2(faceId, salt, {
      keySize: 256 / 32,
      iterations: 1,
      hasher: CryptoJS.algo.SHA512,
    });
    const iv = CryptoJS.PBKDF2(faceId, salt, {
      keySize: 128 / 32,
      iterations: 1,
      hasher: CryptoJS.algo.SHA512,
    });

    const base64 = CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
    const ciphertext = CryptoJS.enc.Hex.parse(base64);

    const decoded = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({
        ciphertext,
      }),
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.NoPadding,
      }
    ).toString(CryptoJS.enc.Utf8);
    return _.trimEnd(decoded, " ");
  },
};

import {v1, v2} from "../src/safe";
import {ALICE, RAWKEY} from './env.test';

describe('Safe testing', () => {
  describe('V1 testing', () => {
    it('V1::encrypt', function () {
      const encrypted = v1.encrypt(
        RAWKEY,
        ALICE.password,
        ALICE.salt
      );
      expect(encrypted).toEqual(ALICE.key);
    });
    it('V1::decrypt', function () {
      const decrypted = v1.decrypt(
        ALICE.key,
        ALICE.password,
        ALICE.salt
      );
      expect(decrypted).toEqual(RAWKEY);
    });
  });

  describe('V2 testing', () => {
    it('V2::aesEncrypt', function () {
      const encrypted = v2.aesEncrypt(
        RAWKEY,
        ALICE.password,
        ALICE.salt
      );
      expect(encrypted).toEqual(ALICE.key);
    });
    it('V2::aesDecrypt', function () {
      const decrypted = v2.aesDecrypt(
        ALICE.key,
        ALICE.password,
        ALICE.salt
      );
      expect(decrypted).toEqual(RAWKEY);
    });
    it('V2::RSA Testing', async function () {
      const key = await v2.rsaKeyPair();
      expect(key).toBeTruthy();

      const plain = "Hello world";
      const encoded = v2.rsaEncrypt(key.publicKey, plain);
      expect(v2.rsaDecrypt(key.privateKey, encoded)).toEqual(plain);
    });
  });
});

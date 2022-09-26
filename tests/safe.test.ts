import safe from "../src/safe";
import {RAWKEY, ALICE} from './env.test';

describe('Safe testing', () => {
  it('Safe::encrypt', function () {
    const decrypted = safe.encrypt(
      RAWKEY,
      ALICE.password,
      ALICE.salt
    );
    expect(decrypted).toEqual(ALICE.key);
  });
  it('Safe::decrypt', function () {
    const decrypted = safe.decrypt(
      ALICE.key,
      ALICE.password,
      ALICE.salt
    );
    expect(decrypted).toEqual(RAWKEY);
  });
});

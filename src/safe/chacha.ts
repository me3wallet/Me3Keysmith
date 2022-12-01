import * as crypto from 'crypto'

const AUTH_TAG_LEN = 16

export function encode(
  hexData: string,
  key: Buffer,
  nonce: Buffer
): string {
  let cipher = crypto.createCipheriv(
      'chacha20-poly1305',
      key,
      nonce,
      {authTagLength: AUTH_TAG_LEN}
    ),
    encrypted = Buffer.concat([
      // @ts-ignore
      cipher.update(Buffer.from(hexData), 'utf8'),
      cipher.final()
    ]),
    tag = cipher.getAuthTag();
  return Buffer.concat([tag, encrypted]).toString('hex');
}

export function decode(
  hexData: string,
  key: Buffer,
  nonce: Buffer
): string {
  const double = AUTH_TAG_LEN * 2
  let decipher = crypto.createDecipheriv(
    'chacha20-poly1305',
    key,
    nonce,
    {authTagLength: AUTH_TAG_LEN}
  );
  decipher.setAuthTag(
    Buffer.from(hexData.substring(0, double), 'hex')
  );
  return [
    // @ts-ignore
    decipher.update(
      Buffer.from(hexData.substring(double), 'hex'),
      'binary',
      'utf8'
    ),
    decipher.final('utf8')
  ].join('');
}

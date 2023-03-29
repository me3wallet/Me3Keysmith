const DriveName = {
  qr: 'ME3_QR',
  json: 'ME3_KEY.json',
}

interface ME3Config {
  endpoint: string;
  partnerId: string;
  redirect_url: string;
}

interface RsaKey {
  privateKey: string;
  publicKey: string;
}

interface Tokens {
  kc_access: string;
  kc_refresh: string;

  // Google access token
  google_access: string;

  // Server side rsa pub key
  rsaPubKey: string;

  // Will be not null only for new users
  uid?: string;
  password?: string;
  salt?: string;
}

interface CommSecret {
  aesPwd?: string;
  aesSalt?: string;
  rsaKey: string; // Private or Public RSA
  isPubKey: boolean;
}

interface CommData {
  secret: string;
  data: string;
}

interface Me3Wallet {
  chainName: string,
  walletName: string,
  walletAddress: string,
  secret: string,
}

export { DriveName, ME3Config, RsaKey, Tokens, CommSecret, CommData, Me3Wallet }

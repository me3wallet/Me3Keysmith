const DriveName = {
  qr: 'ME3_QR',
  json: 'ME3_KEY.json',
}

interface ME3Config {
  endpoint: string;
  partnerId: string;
  client_id: string;
  client_secret: string;
  redirect_uris: [string];
}

interface RsaKey {
  privateKey: string;
  publicKey: string;
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
  chainName: string;
  walletName: string;
  walletAddress: string;
  secret: string;
}

interface WalletRaw {
  walletAddress: string;
  secretRaw: string;
}

export { DriveName, ME3Config, RsaKey, CommSecret, CommData, Me3Wallet, WalletRaw }

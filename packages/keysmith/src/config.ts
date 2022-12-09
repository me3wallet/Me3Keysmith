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

interface CommSecure {
  aesPwd?: string;
  aesSalt?: string;
  rsaKey: string; // Private or Public RSA
  isPubKey: boolean;
}

interface CommData {
  secret: string;
  data: string;
}

export {DriveName, ME3Config, RsaKey, CommSecure, CommData}

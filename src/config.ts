const DriveName = {
  qr: "ME3_QR",
  json: "ME3_KEY.json",
};

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

export { ME3Config, RsaKey, DriveName };

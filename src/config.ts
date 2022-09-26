const DriveName = {
  qr: "ME3_QR",
  json: "ME3_KEY.json",
};

interface ME3Config {
  endpoint: string;
  companyId: number;
  client_id: string;
  client_secret: string;
  redirect_uris: [string];
}

export { ME3Config, DriveName };

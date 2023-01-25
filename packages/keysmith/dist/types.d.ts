declare const DriveName: {
    qr: string;
    json: string;
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
interface Tokens {
    kc_access: string;
    kc_refresh: string;
    google_access: string;
    rsaPubKey: string;
    uid?: string;
    password?: string;
    salt?: string;
}
interface CommSecret {
    aesPwd?: string;
    aesSalt?: string;
    rsaKey: string;
    isPubKey: boolean;
}
interface CommData {
    secret: string;
    data: string;
}
export { DriveName, ME3Config, RsaKey, Tokens, CommSecret, CommData };

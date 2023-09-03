declare const DriveName: {
    qr: string;
    json: string;
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
    rsaKey: string;
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
export { DriveName, ME3Config, RsaKey, CommSecret, CommData, Me3Wallet }

import { AxiosInstance } from 'axios';
import { CommData, ME3Config, Me3Wallet } from './types';
export default class Me3 {
    private readonly _gClient;
    private readonly _client;
    private _apiToken?;
    private _userSecret?;
    private _myPriRsa?;
    private _serverPubRsa?;
    constructor(credential: ME3Config);
    me3ApiClient(): AxiosInstance;
    isInitialized(): boolean;
    getGAuthUrl(): string;
    getGToken(redirectUrl: string): Promise<boolean>;
    getUserInfo(): Promise<import("googleapis").oauth2_v2.Schema$Userinfo>;
    getWallets(): Promise<any>;
    encryptData(data: any, withAES?: boolean): CommData;
    decryptData(data: CommData, withAES?: boolean): any;
    signTx(wallet: Me3Wallet, txRequest: any): Promise<string>;
    private _getChainList;
    private _createWallets;
    private _loadWallets;
    private _loadBackupFile;
    private _exchangeKey;
}

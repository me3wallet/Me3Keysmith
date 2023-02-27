import { AxiosInstance } from 'axios';
import { CommData, ME3Config, Me3Wallet } from './types';
export default class Me3 {
    private _gClient;
    private readonly _client;
    private _apiToken?;
    private _userSecret?;
    private _myPriRsa?;
    private _serverPubRsa?;
    constructor(credential: ME3Config);
    me3ApiClient(): AxiosInstance;
    isInitialized(): boolean;
    getAuthLink(redirectURL: string): Promise<string>;
    getAuthToken(code: string, state: string, sessionState: string): Promise<boolean>;
    getWallets(): Promise<any[]>;
    encryptData(data: any, withAES?: boolean): CommData;
    decryptData(data: CommData, withAES?: boolean): any;
    signTransaction(series: any, walletSecret: any, transactionRequest: any): Promise<string>;
    signTx(wallet: Me3Wallet, txRequest: any): Promise<string>;
    private _getChainList;
    private _createWallets;
    private _loadWallets;
    private _loadBackupFile;
    private _refreshToken;
    private _getUserProfile;
}

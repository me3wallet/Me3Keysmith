import { AxiosInstance } from 'axios';
import { CommData, ME3Config } from './types';
export default class Me3 {
    private _gClient;
    private readonly _client;
    private _apiToken?;
    private _userSecret?;
    private _myPriRsa?;
    constructor(credential: ME3Config);
    me3ApiClient(): AxiosInstance;
    getAuthLink(redirectURL: string): Promise<string>;
    getAuthToken(code: string, state: string, sessionState: string): Promise<boolean>;
    getWallets(): Promise<any[]>;
    encryptData(data: any, withAES?: boolean): CommData;
    decryptData(data: CommData, withAES?: boolean): any;
    signTransaction(series: any, walletSecret: any, transactionRequest: any): Promise<string>;
    private _createWallets;
    private _loadWallets;
    private _loadBackupFile;
    private _refreshToken;
    private _getUserProfile;
}

import { AxiosInstance } from 'axios';
import { CommData, ME3Config } from './types';
export default class Me3 {
    private readonly _gClient;
    private readonly _client;
    private _apiToken?;
    private _userSecret?;
    private _myPriRsa?;
    private _serverPubRsa?;
    constructor(credential: ME3Config);
    me3ApiClient(): AxiosInstance;
    getGAuthUrl(): any;
    getGToken(redirectUrl: string): Promise<boolean>;
    getWallets(): Promise<any[]>;
    encryptData(data: any, withAES?: boolean): CommData;
    decryptData(data: CommData, withAES?: boolean): any;
    private _generateQR;
    private _createWallets;
    private _loadWallets;
    private _loadBackupFile;
    private _exchangeKey;
}

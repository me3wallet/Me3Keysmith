import { CommData, CommSecret } from '../types'
export declare function encrypt(plain: string, commSecret: CommSecret): CommData;
export declare function decrypt(data: CommData, commSecret: CommSecret): string;
export declare function getWalletCiphers(krData: any): ((plainPK: any) => string)[];

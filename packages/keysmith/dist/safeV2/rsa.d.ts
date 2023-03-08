import { RsaKey } from '../types';
export declare function genKeyPair(): RsaKey;
export declare function encrypt(b64Key: string, plainBytes: string): string;
export declare function decrypt(b64Key: string, encryptedForgeBytes: string): string;
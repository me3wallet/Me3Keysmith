/// <reference types="node" />
import { RsaKey } from '../types'
export declare function genKeyPair(): Promise<RsaKey>;
export declare function encrypt(b64Key: string, plain: Buffer, isPubKey?: boolean): Buffer;
export declare function decrypt(b64Key: string, encrypted: Buffer, isPubKey?: boolean): Buffer;

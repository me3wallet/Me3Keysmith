/// <reference types="node" />
export declare function genPassword(): Buffer;
export declare function encrypt(key: Buffer, plain: Buffer): Buffer;
export declare function decrypt(key: Buffer, encrypted: Buffer): Buffer;

export declare function encrypt(utf8PlainBytes: string): {
    keyBytes: string;
    b64DataBytes: string;
};
export declare function decrypt(keyBytes: string, encryptedBytes: string): string;

/// <reference types="node" />
import { Readable } from 'stream';
export default class Google {
    private readonly _auth;
    private readonly _drive;
    private readonly _redirectUrl;
    constructor(clientId: string, clientSecret: string, redirectUrls: [string]);
    generateAuthUrl(): any;
    getTokens(redirectUrl: string): Promise<boolean>;
    getUserEmail(): Promise<string>;
    saveFiles(body: any, fileName: string, mimeType: string): Promise<any>;
    loadFile(fileId: string): Promise<any>;
    b642Readable(base64: string): Readable;
    str2Readable(str: string): Readable;
}

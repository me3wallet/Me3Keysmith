/// <reference types="node" />
import { Readable } from 'stream';
export default class Google {
    private readonly _drive;
    constructor(accessToken: string);
    saveFile(body: any, fileName: string, mimeType: string): Promise<any>;
    loadFile(fileId: string): Promise<any>;
    b642Readable(base64: string): Readable;
    str2Readable(str: string): Readable;
}

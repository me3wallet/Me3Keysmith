import { RecoveryKey } from './types'
export default class GDriveClient {
  private readonly _driveApi
  constructor(accessToken: string);
  saveFile(body: any, fileName: string): Promise<string>;
  retrieveFile(fileId: string): Promise<RecoveryKey>;
  _isUnauthenticatedError(responseBody: any): boolean;
  _isFileNotFoundError(responseBody: any): boolean;
}

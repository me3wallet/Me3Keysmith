import * as _ from 'lodash'
import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import { RecoveryKey } from './types'

export default class GDriveClient {
  private readonly _driveApi: AxiosInstance

  constructor() {
    this._driveApi = axios.create({
      baseURL: 'https://www.googleapis.com/upload/drive/v3',
      timeout: 10000,
    })
  }

  async saveFile(accessToken: string, body: any, fileName: string): Promise<string> {
    const fileData = new FormData()
    fileData.append('metadata', JSON.stringify({
      name: fileName,
      mimeType: 'application/json',
    }), {
      contentType: 'application/json',
    })
    fileData.append('file', JSON.stringify(body))

    try {
      const uploadedFile = await this._driveApi.post(
        '/files',
        fileData,
        {
          params: {
            uploadType: 'multipart',
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            ...fileData.getHeaders(),
          },
        })

      return uploadedFile.data.id
    } catch (error) {
      if (this._isUnauthenticatedError(error)) {
        throw new Error('Invalid authentication credentials! Please provide a valid access token!')
      }
      // log and throw unexpected errors
      // TODO: Improve logging to only log non-sensitive info for debugging
      console.log('error', JSON.stringify(error, null, 2))
      throw new Error('Unexpected error while uploading recovery file to user gDrive! Please contact Me3 and provide the above error log!')
    }
  }

  async loadFile(accessToken: string, fileId: string): Promise<RecoveryKey> {
    try {
      const file = await this._driveApi.get(
        `/files/${fileId}`,
        {
          params: {
            alt: 'media',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

      return file.data as RecoveryKey
    } catch (error) {
      if (this._isUnauthenticatedError(error)) {
        throw new Error('Invalid authentication credentials! Please provide a valid access token!')
      }
      if (this._isFileNotFoundError(error)) {
        throw new Error('Unable to locate file as user have moved/removed recovery file. Please contact Me3 for assistance!')
      }
      // log and throw unexpected errors
      // TODO: Improve logging to only return non-sensitive info for debugging
      console.log('error', JSON.stringify(error, null, 2))
      throw new Error('Unexpected error while retrieving recovery file from user gDrive! Please contact Me3 and provide the above error log!')
    }
  }

  /**
   * Used for identifying expected 'Unauthenticated' error from drive v3 api
   * Note: Highly coupled to drive v3 API response payload structure
   * Refer to test/fixtures/gDrive.ts for response samples
   * Don't rely on HTTP status code -> destructure and extract error code from response.data.error payload
   * @param responseBody: error response from drive api call
   */
  _isUnauthenticatedError(responseBody: any): boolean {
    return _.get(responseBody, ['response', 'data', 'error', 'code'], 500) === 401
  }

  /**
   * Used for identifying expected 'File not found' error from drive v3 api
   * Note: Highly coupled to drive v3 API response payload structure
   * Refer to test/fixtures/gDrive.ts for response samples
   * Don't rely on HTTP status code -> destructure and extract error code from response.data.error payload
   * @param responseBody: error response from drive api call
   */
  _isFileNotFoundError(responseBody: any): boolean {
    return _.get(responseBody, ['response', 'data', 'error', 'code'], 500) === 404
  }
}

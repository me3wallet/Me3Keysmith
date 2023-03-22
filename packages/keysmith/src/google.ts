import { Readable } from 'stream'

import { google } from 'googleapis'

export default class Google {
  private readonly _drive

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: accessToken,
    })
    this._drive = google.drive({ auth, version: 'v3' })
  }

  async saveFile(body: any, fileName: string, mimeType: string) {
    const file = await this._drive.files.create({
      requestBody: {
        name: fileName,
      },
      media: {
        mimeType,
        body,
      },
      fields: 'id',
    })
    return file.data.id
  }

  async loadFile(fileId: string): Promise<any> {
    const file = await this._drive.files.get({
      fileId,
      alt: 'media',
    })
    return file.data
  }

  b642Readable(base64: string) {
    return Readable.from(Buffer.from(base64, 'base64'))
  }

  str2Readable(str: string) {
    return Readable.from(str, { encoding: 'utf8' })
  }
}

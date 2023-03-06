import _ from 'lodash'
import url from 'url'
import { Readable } from 'stream'
import { google, drive_v3, Auth } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
]

export default class Google {
  private readonly _auth: Auth.OAuth2Client
  private readonly _drive: drive_v3.Drive
  private readonly _redirectUrl: string

  constructor(clientId: string, clientSecret: string, redirectUrls: [string]) {
    this._redirectUrl = redirectUrls[0]
    this._auth = new google.auth.OAuth2(
      clientId,
      clientSecret,
      this._redirectUrl
    )

    google.options({ auth: this._auth })
    this._drive = google.drive({ version: 'v3' })
  }

  generateAuthUrl() {
    return this._auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
  }

  /**
   * Tldr: Get user's Google Auth Token after user performs Google SSO
   * - Extracts code from redirectUrl (returned after user performs Google SSO)
   * - The code is used to get Google Auth Token
   * - Token grants this Google Client object authorisation to retrieve user's email address and read+write GDrive
   * @param redirectUrl -> redirect after user performs Google SSO
   * @return boolean -> of whether getting user's token was successful
   */
  async getTokens(redirectUrl: string) {
    let code: string = redirectUrl
    if (
      _.startsWith(redirectUrl, 'https://') ||
      _.startsWith(redirectUrl, 'http://')
    ) {
      if (!_.startsWith(redirectUrl, this._redirectUrl)) return false

      const { query } = url.parse(redirectUrl, true)
      code = _.get(query, 'code') as string
    }
    if (_.isEmpty(code)) return false

    const { tokens } = await this._auth.getToken(code)
    console.log('time now> ', new Date().toISOString())
    tokens!.expiry_date && console.log('token_expiry >', new Date(tokens.expiry_date).toISOString())
    this._auth.setCredentials(tokens)
    return true
  }

  async getUserEmail() {
    const googleAuth = google.oauth2({ version: 'v2' })
    const { data } = await googleAuth.userinfo.get()
    return data.email
  }

  async saveFiles(body: any, fileName: string, mimeType: string) {
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

import path from 'path'
import _ from 'lodash'
import QRLogo from 'qr-with-logo'
import RandomString from 'randomstring'
import * as bip39 from 'bip39'

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { CommData, DriveName, ME3Config } from './types'
import createWallet from './wallet'
import Google from './google'
import { aes, rsa, v2 } from './safe'
import { signTransaction } from './transaction'
import { ethers } from 'ethers'

export default class Me3 {
  private readonly _gClient: Google
  private readonly _client: AxiosInstance

  private _apiToken?: string
  private _userSecret?: any
  private _myPriRsa?: string
  private _serverPubRsa?: string

  constructor(credential: ME3Config) {
    this._gClient = new Google(
      credential.client_id,
      credential.client_secret,
      credential.redirect_uris
    )
    this._client = axios.create({
      baseURL: credential.endpoint,
    })

    const companyHeader = {
      'Company-ID': 2000,
      'Partner-ID': credential.partnerId,
    }
    const _this: Me3 = this
    this._client.interceptors.request.use(function (
      config: AxiosRequestConfig
    ) {
      config.headers = _.chain(companyHeader)
        .set('Light-token', _this._apiToken)
        .pickBy(_.identity)
        .merge(config.headers)
        .value()

      return config
    })
    this._client.interceptors.response.use(function (resp: AxiosResponse) {
      let { data } = resp.data
      const isCipherBody = _.every(['data', 'secret'], _.partial(_.has, data))
      if (isCipherBody) {
        data = _this.decryptData(data, false)
      }
      resp.data = data
      return resp
    })
  }

  /**
   * Please use this instance without `process.env.endpoint`
   */
  me3ApiClient(): AxiosInstance {
    return this._client
  }

  getGAuthUrl() {
    return this._gClient.generateAuthUrl()
  }

  async getGToken(redirectUrl: string): Promise<boolean> {
    return await this._gClient.getTokens(redirectUrl)
  }

  async getWallets() {
    const email = await this._gClient.getUserEmail()
    await this._exchangeKey(email!)

    const { data } = await this._client.post(
      '/api/light/register',
      null,
      {
        params: { faceId: email },
      }
    )

    this._apiToken = _.get(data, 'token', '')
    if (_.isEmpty(this._apiToken)) {
      throw Error('Error! Operation failed.Please contact me3 team!')
    }

    const isNewUser = await this._loadBackupFile(data)
    if (!isNewUser) {
      console.log(`Already exist, Restore wallets for ${email}!`)
      return await this._loadWallets()
    }

    console.log(`New User, Create wallets for ${email}!`)
    const wallets = await this._createWallets()
    const { key, salt, password } = this._userSecret!
    const decryptedKey = aes.decrypt(key, password, salt)

    for (const w of wallets) {
      const encrypted = this.encryptData({
        chainName: w.chainName,
        walletName: w.walletName,
        walletAddress: w.walletAddress,
        secret: aes.encrypt(w.secretRaw, decryptedKey, salt),
        needFocus: true,
      })

      await Promise.all([
        this._client.post('/api/light/addWallet', encrypted),
        this._client.post('/api/mainChain/ping', null, {
          params: {
            chainName: w.chainName,
            status: 3,
          },
        }),
      ])
    }
    return wallets
  }

  encryptData(data: any, withAES = false): CommData {
    const secure = {
      rsaKey: this._serverPubRsa!,
      isPubKey: true,
    }
    if (withAES === true && !_.isEmpty(this._userSecret)) {
      const { password, key, salt } = this._userSecret!
      const decryptedKey = aes.decrypt(key, password, salt)
      _.merge(secure, {
        aesKey: decryptedKey,
        aesSalt: salt,
      })
    }
    return v2.encrypt(JSON.stringify(data), secure)
  }

  decryptData(data: CommData, withAES = false): any {
    const secure = {
      rsaKey: this._myPriRsa!,
      isPubKey: false,
    }
    if (withAES === true && !_.isEmpty(this._userSecret)) {
      const { password, key, salt } = this._userSecret!
      const decryptedKey = aes.decrypt(key, password, salt)
      _.merge(secure, {
        aesKey: decryptedKey,
        aesSalt: salt,
      })
    }

    const decrypted = v2.decrypt(data, secure)
    return JSON.parse(decrypted)
  }

  /**
   * Signs a transaction
   * Only eth series is supported at this time
   * @param series: currency of the transaction to be executed - btc, eth, fil, bch, dot, ltc
   * @param walletData: details of the acting wallet {@link WalletData}
   * @param transactionRequest: parameters of a transaction {@link TransactionRequest}
   * @return string signedTransaction
   */
  async signTransaction(series, walletData, transactionRequest) {
    const privateKey = this._getWalletPrivateKey(walletData)

    return await signTransaction({
      series,
      privateKey,
      transactionRequest,
    })
  }

  private async _generateQR(content: string): Promise<string> {
    const logoPath = path.join(__dirname, '../res', 'logo.png')
    return new Promise((res, rej) => {
      QRLogo.generateQRWithLogo(
        content,
        logoPath,
        { errorCorrectionLevel: 'M' },
        'Base64',
        'qr.png',
        (b64: never) => res(b64)
      ).catch(rej)
    })
  }

  private async _createWallets() {
    const { data: chains } = await this._client.get('/api/mainChain/list')
    const refined: Record<string, [any]> = _.reduce(
      chains,
      (result, acc) => {
        const list = result[_.toLower(acc.series)] || []
        list.push({
          chainName: acc.name,
          walletName: _.trim(`3rd_${acc.description}`),
        })
        result[_.toLower(acc.series)] = list
        return result
      },
      {}
    )

    // Create wallets
    const mnemonic = bip39.generateMnemonic()
    const wallets = new Array<any>()
    for (const [key, list] of _.entries(refined)) {
      const wallet = await createWallet(key, mnemonic)
      if (!_.isEmpty(wallet)) {
        wallets.push(_.map(list, (it) => _.merge(it, wallet)))
      }
    }
    return _.flatten(wallets)
  }

  private async _loadWallets() {
    const { password, key, salt } = this._userSecret!
    const decryptedKey = aes.decrypt(key, password, salt)

    const { data } = await this._client.get('/api/light/secretList')
    return _.chain(data)
      .map((w) => {
        try {
          return {
            chainName: w.chainName,
            walletName: w.walletName,
            walletAddress: w.walletAddress,
            secret: aes.decrypt(w.secret, decryptedKey, salt),
          }
        } catch (e) {
          console.log(
            `Wallet - [${w.chainName}::${w.walletName}::${w.walletAddress} decryption failed`,
            _.get(e, 'message')
          )
        }
        return undefined
      })
      .compact()
      .value()
  }

  private async _loadBackupFile(userDetail?: any) {
    const fetchOrUpdateGFileId = async (fileId?: string) =>
      this._client.post('/api/light/userfileId', null, {
        params: { fileId },
      }).then((resp) => _.get(resp, 'data.fileId'))

    const { uid, password, salt } = userDetail
    if (_.isNil(uid) || _.isNil(password) || _.isNil(salt)) {
      const fileId = await fetchOrUpdateGFileId('')
      if (!_.isEmpty(fileId)) {
        this._userSecret = await this._gClient.loadFile(fileId)
        // False for already exist user
        return false
      }
    }
    const randStr = RandomString.generate({
      charset: 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
      length: 40,
    })
    const key = aes.encrypt(`${randStr}${new Date().getTime()}`, password, salt)
    const secret = _.pickBy({ uid, password, salt, key }, _.identity)
    const jsonStr = JSON.stringify(secret)
    const qrCode = await this._generateQR(jsonStr)

    const [, jsonId] = await Promise.all([
      this._gClient.saveFiles(
        this._gClient.b642Readable(qrCode),
        DriveName.qr,
        'image/png'
      ),
      this._gClient.saveFiles(
        this._gClient.str2Readable(jsonStr),
        DriveName.json,
        'application/json'
      ),
    ])
    await fetchOrUpdateGFileId(jsonId!)
    this._userSecret = secret

    // True for new user
    return true
  }

  private async _exchangeKey(email: string) {
    const { privateKey, publicKey } = await rsa.genKeyPair()
    const { data } = await this._client.post(
      '/api/light/exchange/key',
      {
        email,
        publicKey,
      }
    )

    this._myPriRsa = privateKey
    this._serverPubRsa = data
  }

  /**
   * @param walletData: details of the acting wallet {@link WalletData}
   * @private
   * @return privateKey string
   */
  private _getWalletPrivateKey(walletData) {
    if (!walletData.secret) {
      throw new Error('walletData corrupted, please use me3.getWallet() to fetch user\'s latest wallets')
    }

    const wallet = new ethers.Wallet(walletData.secret)
    return wallet.privateKey
  }
}

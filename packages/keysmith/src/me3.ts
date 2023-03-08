// import path from 'path'
import _ from 'lodash'
// import QRLogo from 'qr-with-logo'
import RandomString from 'randomstring'
import * as bip39 from 'bip39'

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { CommData, DriveName, ME3Config, Me3Wallet } from './types'
import createWallet from './wallet'
import Google from './google'
import { aes, rsa, v2 } from './safe'
import { signTransaction } from './transaction'

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
      credential.redirect_uris,
    )
    this._client = axios.create({
      baseURL: credential.endpoint,
    })

    const companyHeader = {
      'Company-ID': 2000,
      'Partner-ID': credential.partnerId,
    }
    const _this: Me3 = this
    this._client.interceptors.request.use( (config) => {
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
  
  /**
   * Please use before getWallets
   */
  isInitialized(): boolean {
    if (_.isEmpty(this._apiToken)) {
      return false
    }
    if (_.isEmpty(this._userSecret)) {
      return false
    }
    if (_.isEmpty(this._myPriRsa)) {
      return false
    }
    if (_.isEmpty(this._serverPubRsa)) {
      return false
    }
    return true
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
      },
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
    const [cipher] = v2.getWalletCiphers(this._userSecret)
    const wallets = await this._createWallets().then(
      wallets => _.map(wallets, w => ({
        chainName: w.chainName,
        walletName: w.walletName,
        walletAddress: w.walletAddress,
        // TODO: We will provide encrypted private key, as partner wants tx sign on our module
        secret: cipher(w.secretRaw),
      })),
    )
    for (const w of wallets) {
      await Promise.all([
        this._client.post(
          '/api/light/addWallet',
          this.encryptData({ ...w, needFocus: true }),
        ),
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
   * @param wallet: wallet to perform signing {@link Me3Wallet}
   * @param txRequest: parameters of a transaction {@link TransactionRequest}
   * @return string signedTransaction
   */
  async signTx(wallet: Me3Wallet, txRequest) {
    const chains = await this._getChainList()
    const chainFound = _.chain(chains)
      .filter(c => _.toLower(c.name) === _.toLower(wallet.chainName))
      .head()
      .value()
    if (_.isEmpty(chainFound)) {
      throw Error('Chain not supported')
    }

    const [, decipher] = v2.getWalletCiphers(this._userSecret)


    return await signTransaction({
      series: chainFound.series,
      privateKey: decipher(wallet.secret),
      transactionRequest: txRequest,
    })
  }

  // private async _generateQR(content: string): Promise<string> {
  //   const logoPath = path.join(__dirname, '../res', 'logo.png')
  //   return new Promise((res, rej) => {
  //     QRLogo.generateQRWithLogo(
  //       content,
  //       logoPath,
  //       { errorCorrectionLevel: 'M' },
  //       'Base64',
  //       'qr.png',
  //       (b64: never) => res(b64),
  //     ).catch(rej)
  //   })
  // }

  private async _getChainList() {
    const { data: chains } = await this._client.get('/api/mainChain/list')
    return chains
  }

  private async _createWallets() {
    const chains = await this._getChainList()
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
      {},
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
    const { data } = await this._client.get('/api/light/secretList')
    // TODO: No need to be decrypted as we are going to sign tx on our end
    return data
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
    // const qrCode = await this._generateQR(jsonStr)

    const [jsonId] = await Promise.all([
      // this._gClient.saveFiles(
      //   this._gClient.b642Readable(qrCode),
      //   DriveName.qr,
      //   'image/png',
      // ),
      this._gClient.saveFiles(
        this._gClient.str2Readable(jsonStr),
        DriveName.json,
        'application/json',
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
      },
    )

    this._myPriRsa = privateKey
    this._serverPubRsa = data
  }
}

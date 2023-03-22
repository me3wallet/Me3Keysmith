import _ from 'lodash'
import RandomString from 'randomstring'
import * as bip39 from 'bip39'

import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { CommData, DriveName, ME3Config, Tokens, Me3Wallet } from './types'
import createWallet from './wallet'
import { aes, rsa, v2 } from './safeV2'
import { signTransaction } from './transaction'
import GDriveClient from './gDrive'

export default class Me3 {
  private readonly _client: AxiosInstance

  private _apiToken?: Tokens
  // user recovery data
  private _userSecret?: any
  // private RSA key used ONLY for chacha encrypt/decrypt of a single communication b/w client and server
  private _myPriRsa?: string
  private _serverPubRsa?: string

  constructor(credential: ME3Config) {
    this._client = axios.create({
      baseURL: credential.endpoint,
    })

    const companyHeader = {
      'Company-ID': 2000,
      'Partner-ID': credential.partnerId,
    }
    const _this: Me3 = this
    this._client.interceptors.request.use( (config) => {
      let chain = _.chain(companyHeader).pickBy(_.identity)
      if (!_.isEmpty(_this._apiToken?.kc_access)) {
        chain = chain.set('Authorization', `Bearer ${_this._apiToken.kc_access}`)
      }
      config.headers = chain.merge(config.headers).value()
      return config
    })
    this._client.interceptors.response.use(
      function (resp: AxiosResponse) {
        let { data } = resp.data
        const isCipherBody = _.every(['data', 'secret'], _.partial(_.has, data))
        if (isCipherBody) {
          data = _this.decryptData(data, false)
        }
        resp.data = data
        return resp
      },
      function (err) {
        const status = err.response ? err.response.status : null

        if (status === 401) {
          return _this._refreshToken().then(_ => {
            err.config.headers['Authorization'] = `Bearer ${_this._apiToken.kc_access}`
            return _this._client.request(err.config)
          })
        }

        return Promise.reject(err)
      }
    )
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

  /**
   * @param redirectURL
   * @returns interface
   *    data -> redirectUrl in string
   *    myPriRsa -> TENTATIVE, clientside rsa pubkey
   */
  async getAuthLink(redirectURL: string): Promise<{
    data: string;
    myPriRsa: string;
  }> {
    const { privateKey, publicKey } = rsa.genKeyPair()
    this._myPriRsa = privateKey
    const { data } = await this._client.get('/kc/auth/link', {
      params: {
        redirectURL,
        pubKey: publicKey,
      },
    })
    return { data, myPriRsa: this._myPriRsa }
  }

  async getAuthToken(code: string, state: string, sessionState: string, priRsa: string): Promise<Tokens> {
    // TODO: Remove tentative fix for handling priRsa token
    this._myPriRsa = priRsa

    const { data } = await this._client.get('/kc/auth/code', {
      params: {
        code, state,
        session_state: sessionState,
      },
    })
    this._apiToken = data as Tokens
    // TODO: Return only the tokens without user-related info
    return this._apiToken
  }

  async getWallets(accessToken: string) {
    // if (_.isEmpty(this._apiToken)) {
    //   throw Error('Error! Operation failed.Please contact me3 team!')
    // }

    const { email, krFileId } = await this._getUserProfile()
    const isNewUser = await this._loadBackupFile(accessToken, krFileId)
    if (!isNewUser) {
      console.log(`Already exist, Restore wallets for ${email}!`)
      return await this._loadWallets()
    }

    console.log(`New User, Create wallets for ${email}!`)
    const [cipher] = v2.getWalletCiphers(this._userSecret)

    const wallets = await this._createWallets().then(
      results => _.map(results, w => ({
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
      rsaKey: this._apiToken.rsaPubKey,
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

  async manualRefreshToken(refreshToken: string, priRsa: string): Promise<Tokens> {
    // TODO: Remove tentative fix for cross session
    this._myPriRsa = priRsa
    const { data } = await axios.post(
      `${this._client.defaults.baseURL}/kc/auth/refresh`,
      { refresh: refreshToken }
    )
    this._apiToken = data as Tokens
    return this._apiToken
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
    const refined = _.groupBy(
      chains,
      chain => _.toLower(chain.series),
    )

    // Create wallets
    const mnemonic = bip39.generateMnemonic()
    const wallets = new Array<any>()
    for (const entry of _.entries(refined)) {
      const _wallets = await createWallet(entry, mnemonic)
      if (!_.isEmpty(_wallets)) {
        wallets.push(_wallets)
      }
    }
    return _.flatten(wallets)
  }

  private async _loadWallets() {
    const { data } = await this._client.get('/api/light/secretList')
    return _.map(data, (w) => ({
      chainName: w.chainName,
      walletName: w.walletName,
      walletAddress: w.walletAddress,
      secret: w.secret,
    }))
  }

  /**
   *
   * @param accessToken: user's google access_token to authorise read/write to GDrive
   * @param krFileId?: string | undefined/null -> fileId of recovery file if user already has one
   * @private
   */
  private async _loadBackupFile(accessToken: string, krFileId?: string): Promise<boolean> {
    const updateGFileId = async (fileId?: string) =>
      this._client.post('/api/light/userfileId', null, {
        params: { fileId },
      }).then((resp) => _.get(resp, 'data.fileId'))

    if (!_.isEmpty(krFileId)) {
      /**
       * if krFileId exists, it means user already have a recovery file existing
       * proceed to perform retrieval and set to _userSecret variable
       */
      this._userSecret = await new GDriveClient(accessToken).retrieveFile(krFileId)
      return false // False for already exist user
    }
    /**
     * if krFileId does not exist, it means user does not have recovery file existing
     * proceed to generate recovery file using apiToken parameters
     */
    const { uid, password, salt } = this._apiToken
    if (_.isNil(uid) || _.isNil(password) || _.isNil(salt)) {
      throw Error('No KR info!')
    }
    const randStr = RandomString.generate({
      charset: 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
      length: 40,
    })
    const key = aes.encrypt(`${randStr}${new Date().getTime()}`, password, salt)
    const secret = _.pickBy({ uid, password, salt, key }, _.identity)

    /**
     * GDriveClient().saveFile automatically throws Errors when file upload fails
     * allow clientside to implement their own handlers
     * TODO: Standardise error interface to be exported and used for clientside error handling
     */
    const uploadedFileDetails = await new GDriveClient(accessToken).saveFile(secret, DriveName.json)
    const jsonId = _.get(uploadedFileDetails, ['id'])
    await updateGFileId(jsonId!)
    this._userSecret = secret
    // True for new user
    return true
  }

  private async _refreshToken(): Promise<boolean> {
    if (_.isEmpty(this._apiToken?.kc_refresh)) {
      return false
    }
    const { data } = await axios.post(
      `${this._client.defaults.baseURL}/kc/auth/refresh`,
      { refresh: this._apiToken?.kc_refresh }
    )
    // type assert here since decrypted response from /kc/auth/refresh
    // is in the type Tokens
    this._apiToken = this.decryptData(data.data, false) as Tokens
    return true
  }

  /**
   * Get user details from Keycloak
   * @private
   */
  private async _getUserProfile() {
    const { data } = await this._client.get('/kc/api/userInfo')
    return data
  }
}

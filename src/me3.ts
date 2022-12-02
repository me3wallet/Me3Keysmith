import _ from 'lodash';
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import * as bip39 from 'bip39';

import {DriveName, ME3Config, RsaKey} from './config';
import createWallet from './wallet';
import Google from './google';
import path from 'path';
import {v2} from "./safe";

const QRLogo = require('qr-with-logo');
const RandomString = require('randomstring');

export default class Me3 {
  private readonly _gClient: Google;
  private _token?: string;
  private _secret?: any;
  private readonly _client: AxiosInstance;

  private _myRsaKey?: RsaKey;
  private _hisRsaPub?: string;

  constructor(credential: ME3Config) {
    this._gClient = new Google(
      credential.client_id,
      credential.client_secret,
      credential.redirect_uris
    );
    this._client = axios.create({
      baseURL: credential.endpoint,
    });

    const companyHeader = {
      'Company-ID': 2000,
      'Partner-ID': credential.partnerId,
    };
    const _this: Me3 = this;
    this._client.interceptors.request.use(function (
      config: AxiosRequestConfig
    ) {
      config.headers = _.chain(companyHeader)
        .set('Light-token', _this._token)
        .pickBy(_.identity)
        .merge(config.headers)
        .value();
      return config;
    });
    this._client.interceptors.response.use(function (resp: AxiosResponse) {
      const {data} = resp.data;
      resp.data = data;
      return resp;
    });
  }

  getGAuthUrl() {
    return this._gClient.generateAuthUrl();
  }

  async getGToken(redirectUrl: string): Promise<boolean> {
    return await this._gClient.getTokens(redirectUrl);
  }

  async getWallets() {
    const email = await this._gClient.getUserEmail();
    await this._exchangeKey(email!);

    const {data} = await this._client.post('/api/light/register', null, {
      params: {aesPwd: email},
    });

    this._token = _.get(data, 'token', '');
    if (_.isEmpty(data) || _.isEmpty(this._token)) {
      throw Error('Error! Operation failed.Please contact me3 team!');
    }

    const serverEncrypted = _.get(data, 'key', undefined);
    const isNewUser = await this._loadBackupFile(serverEncrypted);
    if (!isNewUser) {
      console.log(`Already exist, Restore wallets for ${email}!`);
      return await this._loadWallets();
    }

    console.log(`New User, Create wallets for ${email}!`);
    const wallets = await this._createWallets();
    const {key, salt, password} = this._secret!;
    const decryptedKey = v2.aesDecrypt(key, password, salt);
    for (const w of wallets) {
      await Promise.all([
        this._client.post('/api/light/addWallet', null, {
          params: {
            chainName: w.chainName,
            walletName: w.walletName,
            walletAddress: w.walletAddress,
            secret: v2.aesEncrypt(w.secretRaw, decryptedKey, salt),
            needFocus: true,
          },
        }),
        this._client.post('/api/mainChain/ping', null, {
          params: {
            chainName: w.chainName,
            status: 3,
          },
        }),
      ]);
    }
    return wallets;
  }

  private async _generateQR(content: string): Promise<string> {
    const logoPath = path.join(__dirname, '../res', 'logo.png');
    return new Promise((res, rej) => {
      QRLogo.generateQRWithLogo(
        content,
        logoPath,
        {errorCorrectionLevel: 'M'},
        'Base64',
        'qr.png',
        (b64: never) => res(b64)
      ).catch(rej);
    });
  }

  private async _createWallets() {
    const {data: chains} = await this._client.get('/api/mainChain/list');
    const refined: Record<string, [any]> = _.reduce(
      chains,
      (result, acc) => {
        const list = result[_.toLower(acc.series)] || [];
        list.push({
          chainName: acc.name,
          walletName: _.trim(`3rd_${acc.description}`),
        });
        result[_.toLower(acc.series)] = list;
        return result;
      },
      {}
    );

    // Create wallets
    const mnemonic = bip39.generateMnemonic();
    const wallets = new Array<any>();
    for (const [key, list] of _.entries(refined)) {
      const wallet = await createWallet(key, mnemonic);
      if (!_.isEmpty(wallet)) {
        wallets.push(_.map(list, (it) => _.merge(it, wallet)));
      }
    }
    return _.flatten(wallets);
  }

  private async _loadWallets() {
    const {password, key, salt} = this._secret!;
    const decryptedKey = v2.aesDecrypt(key, password, salt);

    const {data} = await this._client.get('/api/light/secretList');
    return _.chain(data)
      .map((w) => {
        try {
          return {
            chainName: w.chainName,
            walletName: w.walletName,
            walletAddress: w.walletAddress,
            secret: v2.aesDecrypt(w.secret, decryptedKey, salt),
          };
        } catch (e) {
          console.log(
            `Wallet - [${w.chainName}::${w.walletName}::${w.walletAddress} decryption failed`,
            _.get(e, 'message')
          );
        }
        return undefined;
      })
      .compact()
      .value();
  }

  private async _loadBackupFile(serverEncrypted?: string) {
    const funcFileId = async (fileId?: string) =>
      this._client
        .post('/api/light/userfileId', null, {
          params: {fileId},
        })
        .then((resp) => _.get(resp, 'data.fileId'));

    if (_.isEmpty(serverEncrypted)) {
      const fileId = await funcFileId('');
      if (!_.isEmpty(fileId)) {
        this._secret = await this._gClient.loadFile(fileId);
        // False for already exist user
        return false;
      }
    }

    const {uid, password, salt} = JSON.parse(await v2.rsaDecrypt(
      serverEncrypted!,
      this._myRsaKey!.privateKey
    ));

    const randStr = RandomString.generate({
      charset: 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
      length: 40,
    });
    const key = v2.aesEncrypt(
      `${randStr}${new Date().getTime()}`,
      password,
      salt
    );

    const secret = _.pickBy(
      {
        uid,
        password,
        salt,
        key,
      },
      _.identity
    );
    const jsonStr = JSON.stringify(secret);
    const qrCode = await this._generateQR(jsonStr);

    const [, jsonId] = await Promise.all([
      this._gClient.saveFiles(
        this._gClient.base642Readable(qrCode),
        DriveName.qr,
        'image/png'
      ),
      this._gClient.saveFiles(
        this._gClient.string2Readable(jsonStr),
        DriveName.json,
        'application/json'
      ),
    ]);
    await funcFileId(jsonId!);
    this._secret = secret;

    // True for new user
    return true;
  }

  private async _exchangeKey(email: string) {
    this._myRsaKey = await v2.rsaKeyPair();
    const {data} = await this._client.post(
      '/api/light/exchange/key',
      {
        email,
        publicKey: this._myRsaKey?.publicKey
      }
    );
    this._hisRsaPub = data;
  }
}

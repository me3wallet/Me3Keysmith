import _ from 'lodash'

import { IChainContext } from '../_share_/context'
import { WalletCipher } from '../../safeV2/v2'
import { Me3Wallet } from '../../types'
import { getWalletName } from '../_share_/functions'

const getGenerator = (series: string) => {
  switch (_.toLower(series)) {
  case 'btc':
    return require('bitcore-lib')
  case 'ltc':
    return require('bitcore-lib-ltc')
  case 'bch':
    return require('bitcore-lib-cash')
  default:
    break
  }
  return undefined
}

export class BitcoinContext implements IChainContext {
  readonly series: string

  constructor(_series: string) {
    this.series = _series
  }
  createWallet(chains: any[], mnemonic: string, pkCipher: WalletCipher): Promise<Me3Wallet[]> {
    const wallets = _.chain(chains)
      .map(c => {
        const generator = getGenerator(c.series)
        if (_.isEmpty(generator)) {
          return undefined
        }

        const value = Buffer.from(mnemonic, 'utf8')
        const hash = generator.crypto.Hash.sha256(value)
        const bn = generator.crypto.BN.fromBuffer(hash)
        const privateKey = new generator.PrivateKey(bn)

        return {
          walletAddress: privateKey.toAddress().toString(),
          secret: pkCipher(privateKey.toString()),
          walletName: getWalletName(c.description),
          chainName: c.name,
        } as Me3Wallet
      })
      .compact()
      .value()
    return Promise.resolve(wallets)
  }

  signTx(mainChain, wallet: Me3Wallet, tx: any, pkDecipher: WalletCipher): Promise<string> {
    // TODO: BTC tx signning
    return Promise.resolve('')
  }
}
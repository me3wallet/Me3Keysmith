import _ from 'lodash'
import * as signer from '@zondax/filecoin-signing-tools'

import { IChainContext } from '../_share_/context'
import { WalletCipher } from '../../safeV2/v2'
import { Me3Wallet } from '../../types'
import { getWalletName } from '../_share_/functions'

export class FileContext implements IChainContext {
  readonly series: string

  constructor(_series: string) {
    this.series = _series
  }

  createWallet(chains: any[], mnemonic: string, pkCipher: WalletCipher): Promise<Me3Wallet[]> {
    const wallets = _.chain(chains)
      .map(c => {
        const accountIdx = 0
        const path = `${c.path}${accountIdx}`

        const key = signer.keyDerive(
          mnemonic,
          path,
          _.toLower(c.name) === 'fil' ? 'mainnet' : 'testnet'
        )

        return {
          walletAddress: key.address,
          secret: pkCipher(key.private_base64),
          walletName: getWalletName(c.description),
          chainName: c.name,
        } as Me3Wallet
      })
      .compact()
      .value()

    return Promise.resolve(wallets)
  }

  signTx(mainChain, wallet: Me3Wallet, tx: any, pkDecipher: WalletCipher): Promise<string> {
    // TODO: File tx signning
    return Promise.resolve('')
  }
}

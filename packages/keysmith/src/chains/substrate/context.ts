import {
  cryptoIsReady,
  cryptoWaitReady,
  encodeAddress,
  mnemonicToMiniSecret,
  sr25519PairFromSeed,
} from '@polkadot/util-crypto'

import { IChainContext } from '../_share_/context'
import { Me3Wallet } from '../../types'
import { WalletCipher } from '../../safeV2/v2'
import { u8aToHex } from '@polkadot/util'
import { getWalletName } from '../_share_/functions'

export class SubstrateContext implements IChainContext {
  readonly series: string

  constructor(_series: string) {
    this.series = _series
    if (!cryptoIsReady()) {
      cryptoWaitReady().then(console.log)
    }
  }
  createWallet(chains: any[], mnemonic: string, pkCipher: WalletCipher): Promise<Me3Wallet[]> {
    const mini = mnemonicToMiniSecret(mnemonic)
    const { publicKey, secretKey } = sr25519PairFromSeed(mini)
    const walletAddress = encodeAddress(publicKey)
    const secret = pkCipher(u8aToHex(secretKey))

    const wallets = chains.map(c => {
      return {
        chainName: c.name,
        walletName: getWalletName(c.description),
        walletAddress,
        secret,
      } as Me3Wallet
    })

    return Promise.resolve(wallets)
  }

  signTx(mainChain, wallet: Me3Wallet, tx: any, pkDecipher: WalletCipher): Promise<string> {
    // TODO
    return Promise.resolve('')
  }

}
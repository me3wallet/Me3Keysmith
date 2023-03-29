import { IChainContext } from '../_share_/context'
import { WalletCipher } from '../../safeV2/v2'
import { Me3Wallet } from '../../types'

// TODO
export class CosmosContext implements IChainContext {
  readonly series: string

  createWallet(chains: any[], mnemonic: string, pkCipher: WalletCipher): Promise<Me3Wallet[]> {
    return Promise.resolve([])
  }

  signTx(mainChain, wallet: Me3Wallet, tx: any, pkDecipher: WalletCipher): Promise<string> {
    return Promise.resolve('')
  }

}
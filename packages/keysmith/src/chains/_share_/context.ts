import { Me3Wallet } from '../../types'
import { WalletCipher } from '../../safeV2/v2'

export interface IChainContext {
  readonly series: string

  createWallet(chains: any[], mnemonic: string, pkCipher: WalletCipher): Promise<Me3Wallet[]>

  signTx(mainChain, wallet: Me3Wallet, tx: any, pkDecipher: WalletCipher): Promise<string>
}
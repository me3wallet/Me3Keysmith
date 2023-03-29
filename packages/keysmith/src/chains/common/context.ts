import { Me3Wallet } from '../../types'

export interface IChainContext {
  readonly series: string

  createWallet(chains: any[], mnemonic: string, pkCipher: (pk: string) => string): Promise<Me3Wallet[]>

  signTx(wallet: Me3Wallet, tx: any, pkDecipher: (pk: string) => string): Promise<string>
}
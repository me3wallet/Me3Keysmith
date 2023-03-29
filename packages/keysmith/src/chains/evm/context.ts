import { ethers } from 'ethers'
import { Me3Wallet } from '../../types'
import { IChainContext } from '../_share_/context'
import { WalletCipher } from '../../safeV2/v2'
import { TransactionRequest } from './domain'
import { getWalletName } from '../_share_/functions'

export class EvmContext implements IChainContext {
  readonly series: string

  constructor(_series: string) {
    this.series = _series
  }

  createWallet(chains: any[], mnemonic: string, cipher: WalletCipher): Promise<Me3Wallet[]> {
    const wallets = chains.map(c => {
      const accountIdx = 0
      const path = `${c.path}${accountIdx}`

      const wallet = ethers.Wallet.fromMnemonic(mnemonic, path)
      return {
        walletAddress: wallet.address,
        secret: cipher(wallet.privateKey),
        chainName: c.name,
        walletName: getWalletName(c.description),
      } as Me3Wallet
    })

    return Promise.resolve(wallets)
  }

  async signTx(_, wallet: Me3Wallet, tx: TransactionRequest, pkDecipher: WalletCipher): Promise<string> {
    const rawPK = pkDecipher(wallet.secret)
    try {
      const wallet = new ethers.Wallet(rawPK)
      return await wallet.signTransaction(tx)
    } catch (error) {
      throw new Error('Invalid privateKey provided')
    }
  }
}
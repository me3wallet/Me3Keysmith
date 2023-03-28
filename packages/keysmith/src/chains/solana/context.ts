import * as bip39 from 'bip39'
import * as bs58 from 'bs58'
import web3, { Keypair } from '@solana/web3.js'

import { IChainContext } from '../common/context'
import { Me3Wallet } from '../../types'

import { getWalletName } from '../../wallet/create-wallet/common'

export default class SolanaContext implements IChainContext {
  readonly series: string

  constructor(_series: string) {
    this.series = _series
  }

  async createWallet(
    chains: any[],
    mnemonic: string,
    pkCipher: (pk: string) => string
  ): Promise<Me3Wallet[]> {
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const keypair = Keypair.fromSeed(seed.subarray(0, 32))
    const wallets = chains.map(c => {
      return {
        chainName: c.name,
        walletName: getWalletName(c.name),
        walletAddress: keypair.publicKey.toBase58(),
        secret: pkCipher(bs58.encode(keypair.secretKey)),
      } as Me3Wallet
    })
    return wallets
  }

  signTx(
    wallet: Me3Wallet,
    tx: web3.Transaction,
    pkDecipher: (pk: string) => string
  ): string {
    const rawPK = pkDecipher(wallet.secret)
    const rawPKBytes = bs58.decode(rawPK)
    tx.sign(rawPKBytes)
    return bs58.encode(tx.serialize())
  }
}
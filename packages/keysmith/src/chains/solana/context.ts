import _ from 'lodash'
import * as bip39 from 'bip39'
import * as bs58 from 'bs58'
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js'

import { IChainContext } from '../common/context'
import { Me3Wallet } from '../../types'
import { getWalletName } from '../../wallet/create-wallet/common'

// TODO: How to use mainChain's node?
const RpcEndpoints = {
  'sol': 'mainnet-beta',
  'soldev': 'devnet',
}
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

  async signTx(
    wallet: Me3Wallet,
    tx: Transaction,
    pkDecipher: (pk: string) => string
  ): Promise<string> {
    if (_.isEmpty(tx.recentBlockhash) || _.isNil(tx.lastValidBlockHeight)) {
      const rpcURL = clusterApiUrl(RpcEndpoints[_.toLower(wallet.chainName)])
      const solConn = new Connection(rpcURL)
      const lastHash = await solConn.getLatestBlockhash('confirmed')
      tx.recentBlockhash = lastHash.blockhash
      tx.lastValidBlockHeight = lastHash.lastValidBlockHeight
    }

    const rawPK = pkDecipher(wallet.secret)
    const rawPKBytes = bs58.decode(rawPK)
    tx.sign({
      publicKey: new PublicKey(wallet.walletAddress),
      secretKey: rawPKBytes,
    })
    const bytes = tx.serialize()
    return bs58.encode(bytes)
  }
}
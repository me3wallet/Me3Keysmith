import _ from 'lodash'
import * as bip39 from 'bip39'
import { describe } from 'mocha'
import { expect } from 'chai'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'

import { v2 } from '../../src/safeV2'
import SolanaContext from '../../src/chains/solana/context'
import { IChainContext } from '../../src/chains/_share_/context'
import { mockGetChainListResponse } from '../fixtures/me3-get-chain-list'
import { ALICE } from '../fixtures/configs'
import { Me3Wallet } from '../../src/types'

const SERIES = 'sol'
describe('Solana context testing', () => {
  let solanaCtx: IChainContext
  let wallets: Me3Wallet[]

  before(function () {
    solanaCtx = new SolanaContext(SERIES)
  })

  it('SolanaContext::createWallet', async function () {
    const mnemonic = bip39.generateMnemonic()

    const chainMap = _.groupBy(
      mockGetChainListResponse.data,
      it => _.toLower(it.series)
    )

    const [cipher] = v2.getWalletCiphers(ALICE)
    wallets = await solanaCtx.createWallet(chainMap[SERIES], mnemonic, cipher)

    expect(wallets.length).equal(2)
  })

  it('SolanaContext::signTx', async function () {
    const [, decipher] = v2.getWalletCiphers(ALICE)

    const sender = new PublicKey(wallets[0].walletAddress)
    const receiver = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

    const tx = new Transaction()
    {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: receiver,
          lamports: 1000000,
        })
      )
      // We can add more instructions here
    }
    const rawTx = await solanaCtx.signTx(wallets[0], tx, decipher)
    expect(rawTx).to.not.be.null
  })
})
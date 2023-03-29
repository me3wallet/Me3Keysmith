import _ from 'lodash'
import * as bip39 from 'bip39'
import { describe } from 'mocha'
import { expect } from 'chai'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'

import { v2 } from '../../src/safeV2'
import { FileContext, IChainContext, SolanaContext } from '../../src/chains'
import { mockGetChainListResponse } from '../fixtures/me3-get-chain-list'
import { ALICE } from '../fixtures/configs'
import { Me3Wallet } from '../../src/types'
import { utils } from 'ethers'

const SERIES = 'fil'
describe('File context testing', () => {
  let fileCtx: IChainContext
  let wallets: Me3Wallet[]
  let chainMap

  before(function () {
    fileCtx = new FileContext(SERIES)
  })

  it('FileContext::createWallet', async function () {
    const mnemonic = bip39.generateMnemonic()

    chainMap = _.groupBy(
      mockGetChainListResponse.data,
      it => _.toLower(it.series)
    )
    const size = chainMap[SERIES].length
    const [cipher] = v2.getWalletCiphers(ALICE)
    wallets = await fileCtx.createWallet(chainMap[SERIES], mnemonic, cipher)

    expect(wallets.length).equal(size)
  })
})
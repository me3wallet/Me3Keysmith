import _ from 'lodash'
import * as bip39 from 'bip39'
import { describe } from 'mocha'
import { expect } from 'chai'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'

import { v2 } from '../../src/safeV2'
import { EvmContext, IChainContext, SolanaContext } from '../../src/chains'
import { mockGetChainListResponse } from '../fixtures/me3-get-chain-list'
import { ALICE } from '../fixtures/configs'
import { Me3Wallet } from '../../src/types'
import { utils } from 'ethers'

const SERIES = 'eth'
describe('Evm context testing', () => {
  let ethCtx: IChainContext
  let wallets: Me3Wallet[]
  let chainMap

  before(function () {
    ethCtx = new EvmContext(SERIES)
  })

  it('EvmContext::createWallet', async function () {
    const mnemonic = bip39.generateMnemonic()

    chainMap = _.groupBy(
      mockGetChainListResponse.data,
      it => _.toLower(it.series)
    )

    const [cipher] = v2.getWalletCiphers(ALICE)
    const size = chainMap[SERIES].length
    wallets = await ethCtx.createWallet(chainMap[SERIES], mnemonic, cipher)

    expect(wallets.length).equal(size)
  })

  it('EvmContext::signTx', async function () {
    const [, decipher] = v2.getWalletCiphers(ALICE)

    const tx = {
      to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      value: utils.parseEther('1.0'),
    }

    const found = _.find(chainMap[ethCtx.series], c => c.name === wallets[0].chainName)
    const rawTx = await ethCtx.signTx(found, wallets[0], tx, decipher)
    expect(rawTx).to.not.be.null
  })
})
import _ from 'lodash'
import * as bip39 from 'bip39'
import { describe } from 'mocha'

import { v2 } from '../../src/safeV2'
import { IChainContext } from '../../src/chains/common/context'
import SolanaContext from '../../src/chains/solana/context'
import { mockGetChainListResponse } from '../fixtures/me3-get-chain-list'
import { ALICE } from '../fixtures/configs'

const SERIES = 'sol'
describe('Solana context testing', () => {
  let solanaCtx: IChainContext

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
    const wallets = await solanaCtx.createWallet(chainMap[SERIES], mnemonic, cipher)

    expect(wallets.length).toEqual(2)
  })
})
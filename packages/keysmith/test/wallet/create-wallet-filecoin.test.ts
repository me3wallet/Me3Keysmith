import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'

import { createFileCoinWallet } from '../../src/wallet/create-wallet/filecoin'

chai.use(chaiAsPromised)
const { expect } = chai

describe('createWallet - filecoin', () => {
  const mnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young'

  it('Should return walletAddress and secretRaw when provided mnemonic', async () => {

    // @zondax/filecoin-signing-tools
    const newLib = createFileCoinWallet([
      {
        series: 'fil',
        name: 'FIL',
        walletName: 'TestWallet',
      },
    ], mnemonic)
    console.info('output >', newLib)

    expect(newLib).to.deep.equal([{
      chainName: 'FIL',
      walletName: 'TestWallet',
      secretRaw: 'QNRGtRs1VdeqlXs8btpxrmEtzKOYybtfTcqqsigfBsA=',
      walletAddress: 'f1trmstlgfyfpo6ineunloaeygjzpcfvq2dvbqtzi',
    }])
  })
})
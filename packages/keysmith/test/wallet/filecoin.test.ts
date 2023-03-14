import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'

import { createFileCoinWallet } from '../../src/wallet/create-wallet/filecoin'
import { fileCoinChainData } from '../fixtures/me3-get-chain-list'

chai.use(chaiAsPromised)
const { expect } = chai

describe('createWallet - filecoin', () => {
  const mnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young'

  it('Should return walletAddress and secretRaw when provided mnemonic', async () => {

    // @zondax/filecoin-signing-tools
    const newLib = createFileCoinWallet([
      fileCoinChainData,
    ], mnemonic)
    console.info('output >', newLib)

    expect(newLib).to.deep.equal([{
      chainName: 'FIL',
      secretRaw: 'aGTWNLdKHhuM++4NShyZSRMNX5t2dpn1ZrF9DRRWon0=',
      walletAddress: 'f1trmopbet34d6plho2xufnzhy3u64moj3e24hdvq',
      walletName: '3rd_Filecoin',
    }])
  })
})
import { utils } from 'ethers'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'

import { performSignEvmTransaction } from '../../src/transaction/perform-sign-transaction'

chai.use(chaiAsPromised)
const { expect } = chai

describe('performSignEvmTransaction unit test', () => {
  it('Should throw when provided invalid privateKey', async () => {
    const privateKey = 'invalid-priKey'
    const tx = {
      to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      value: utils.parseEther('1.0'),
    }

    await expect(performSignEvmTransaction(privateKey, tx)).to.eventually.be.rejectedWith('Invalid privateKey provided')
  })

  it('Should return signed tx when provided a valid privateKey and tx', async () => {
    // Examples derived from https://docs.ethers.org/v5/api/signer/#Wallet
    const privateKey = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'
    const tx = {
      to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      value: utils.parseEther('1.0'),
    }

    const signed = await performSignEvmTransaction(privateKey, tx)

    expect(signed).to.deep.equal('0xf865808080948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a7640000801ca0918e294306d177ab7bd664f5e141436563854ebe0a3e523b9690b4922bbb52b8a01181612cec9c431c4257a79b8c9f0c980a2c49bb5a0e6ac52949163eeb565dfc')
  })
})
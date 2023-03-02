import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'

import { signTransaction } from '../../src/transaction'
import { utils } from 'ethers'

chai.use(chaiAsPromised)
const { expect } = chai

// valid reusable fixtures
const privateKey = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'
const tx = {
    to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    value: utils.parseEther('1.0'),
}

describe('signTransaction unit test', () => {
    it('Should throw when provided unsupported series', async () => {
        const invalidSeries = 'zil'

        await expect(
            signTransaction({
            series: invalidSeries,
            privateKey,
            transactionRequest: tx,
        })).to.eventually.be.rejectedWith('Unsupported series')
    });

    ['btc', 'ltc', 'fil', 'dot', 'bch'].forEach((series) => {
        it(`Should throw when provided series that is not implemented yet - series=${series}`, async () => {
            await expect(
                signTransaction({
                    series,
                    privateKey,
                    transactionRequest: {},
                })
            ).to.eventually.be.rejectedWith('Not implemented yet')
        })
    })

    it('Should return signed transaction when provided an evm (eth) series, valid privateKey and tx', async () => {
        const signedTx = await signTransaction({
            series: 'eth',
            privateKey,
            transactionRequest: tx,
        })

         expect(signedTx).to.deep.equal('0xf865808080948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a7640000801ca0918e294306d177ab7bd664f5e141436563854ebe0a3e523b9690b4922bbb52b8a01181612cec9c431c4257a79b8c9f0c980a2c49bb5a0e6ac52949163eeb565dfc')
    })
})
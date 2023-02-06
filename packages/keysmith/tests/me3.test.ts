import Me3 from '../src'
import { CONFIG, REDIRECTED } from './test-fixtures'
import { utils } from 'ethers'
import sinon from 'sinon'

import { v2, aes } from '../src/safe'

describe.skip('Me3 class testing', () => {
  const me3 = new Me3(CONFIG)

  it('Me3::getGAuthUrl', function () {
    const authURL = me3.getGAuthUrl()
    console.log(authURL)
    expect(authURL).toBeTruthy()
  })
  it('Me3::getGToken', async function () {
    const success = await me3.getGToken(REDIRECTED)
    expect(success).toBe(true)
  })
  it('Me3::getWallets', async function () {
    const wallets = await me3.getWallets()
    console.log(wallets)
    expect(wallets.length).toBe(15)
  })
})

const tx = {
  to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  value: utils.parseEther('1.0'),
}
const walletSecret = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'
const privateKey = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'

describe('Me3 class unit test::signTransaction()', () => {
  let me3Ins: Me3
  let aesDecryptStub

  beforeAll(() => {
    aesDecryptStub = sinon.stub(aes, 'decrypt').returns(privateKey)
    const outputOfGetWalletCiphers = ['', aesDecryptStub]
    sinon.stub(v2, 'getWalletCiphers').returns(outputOfGetWalletCiphers)
    me3Ins = new Me3(CONFIG)
  })

  it('should throw when series provided is unsupported', async () => {
    await expect(async () => await me3Ins.signTransaction(
        'zil',
        walletSecret
        , tx)
    ).rejects.toThrow('Unsupported series')
  })

  it('should throw when series provided is not implemented yet', async () => {
    await expect(async () => await me3Ins.signTransaction(
        'btc',
        walletSecret,
        tx)
    ).rejects.toThrow('Not implemented yet')
  })


  it('should sign tx', async () => {
    const signed = await me3Ins.signTransaction('eth', walletSecret, tx)

    expect(signed).toEqual('0xf865808080948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a7640000801ca0918e294306d177ab7bd664f5e141436563854ebe0a3e523b9690b4922bbb52b8a01181612cec9c431c4257a79b8c9f0c980a2c49bb5a0e6ac52949163eeb565dfc')
  })
})

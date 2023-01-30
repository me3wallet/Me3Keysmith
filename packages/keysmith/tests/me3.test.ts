import Me3 from '../src'
import { CONFIG, REDIRECTED } from './env.test'
import { utils } from 'ethers'

describe('Me3 class testing', () => {
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

describe('Me3 class unit test::signTransaction()', () => {
  let me3Ins: Me3
  beforeAll(() => {
    me3Ins = new Me3(CONFIG)
  })

  it('should throw when series provided is unsupported', async () => {
    await expect(async () => await me3Ins.signTransaction(
        'zil',
        {
          secret: '0xc7647df8d95d8e057f08d85986eeb8491da289d40a8db8df3595bbdb89637d39',
          chainName: 'ZIL',
        }, tx)).rejects.toThrow('Unsupported series')
  })

  it('should throw when series provided is not implemented yet', async () => {
    await expect(async () => await me3Ins.signTransaction(
        'btc',
        {
          secret: '0xc7647df8d95d8e057f08d85986eeb8491da289d40a8db8df3595bbdb89637d39',
          chainName: 'BTC',
        }, tx)).rejects.toThrow('Not implemented yet')
  })


  it('should sign tx', async () => {
const signed = await me3Ins.signTransaction('eth', { secret: '0xc7647df8d95d8e057f08d85986eeb8491da289d40a8db8df3595bbdb89637d39', chainName: 'ETH' }, tx)

      expect(signed).toBeTruthy()
  })
})

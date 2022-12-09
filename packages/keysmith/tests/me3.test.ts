import Me3 from '../src'
import {CONFIG, REDIRECTED} from './env.test'

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

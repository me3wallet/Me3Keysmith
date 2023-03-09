import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'

import Google from '../src/google'
import { ALICE, REDIRECTED, CONFIG } from './fixtures/configs'

chai.use(chaiAsPromised)
const { expect } = chai

/**
 * Note: To be deprecated after Keycloak implementation
 * Will not fix
 */
describe.skip('Google OAuth Client Object testing', () => {
  let gClient: Google

  before(() => {
    gClient = new Google(
      CONFIG.client_id,
      CONFIG.client_secret,
      CONFIG.redirect_uris
    )
  })

  it('Google.generateAuthUrl() - should be able to return an oauth2 url', async () => {
    const urlStartsWithProperUrl = gClient.generateAuthUrl().startsWith('https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope')

    expect(urlStartsWithProperUrl).to.be.ok
  })

  it('Google::getTokens', async function () {
    await gClient.getTokens(REDIRECTED)
    const email = await gClient.getUserEmail()
    expect(email).to.be.ok
  })

  it('Google::uploadFile & loadFile', async function () {
    const email = await gClient.getUserEmail()
    expect(email).to.be.ok

    // const imgId = await gClient.saveFiles(
    //   gClient.b642Readable(TEST_QR),
    //   'hello.png',
    //   'image/png'
    // )
    // console.log(imgId)
    // expect(imgId).to.be.ok

    const secure = JSON.stringify(ALICE)
    const jsonId = await gClient.saveFiles(
      gClient.str2Readable(secure),
      'hello.json',
      'application/json'
    )
    console.log(jsonId)
    expect(jsonId).to.be.ok

    const json = await gClient.loadFile(jsonId!)
    expect(json).to.deep.equal(ALICE)
  })
})

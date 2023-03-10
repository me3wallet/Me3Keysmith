import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'

import Google from '../src/google'
import { ALICE } from './fixtures/configs'

chai.use(chaiAsPromised)
const { expect } = chai

/**
 * Note: To be deprecated after Keycloak implementation
 * Will not fix
 */
describe.skip('Google OAuth Client Object testing', () => {
  let gClient: Google

  before(() => {
    gClient = new Google('')
  })

  it('Google::uploadFile & loadFile', async function () {
    const secure = JSON.stringify(ALICE)
    const jsonId = await gClient.saveFile(
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

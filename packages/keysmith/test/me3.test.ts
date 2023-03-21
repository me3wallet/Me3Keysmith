import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { utils } from 'ethers'
import { describe } from 'mocha'
import MockAdapter from 'axios-mock-adapter'
import sinon from 'sinon'

import Me3 from '../src'
import { CONFIG, REDIRECTED, workableConfig } from './fixtures/configs'
import { v2, aes } from '../src/safeV2'
import { mockGetChainListResponse } from './fixtures/me3-get-chain-list'
import axios from 'axios'

chai.use(chaiAsPromised)
const { expect } = chai

describe.skip('Me3 class testing', () => {
  const me3 = new Me3(CONFIG)

  it('Me3::getGAuthUrl', function () {
    const authURL = me3.getAuthLink(REDIRECTED)
    console.log(authURL)
    expect(authURL).to.be.ok
  })

  it('Me3::getGToken', async function () {
    const success = await me3.getAuthToken(
      '',
      '',
      '',
      ''
    )
    expect(success).to.be.ok
  })

  it('Me3::getWallets', async function () {
    const wallets = await me3.getWallets()
    console.log(wallets)
    expect(wallets.length).to.deep.equal(15)
  })
})

const tx = {
  to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  value: utils.parseEther('1.0'),
}
const privateKey = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'

describe('Me3 class unit test::signTx()', () => {
  let me3Ins: Me3
  let aesDecryptStub
  let mockAxios: MockAdapter

  beforeEach(() => {
    // stub aes encrypt/decrypt
    aesDecryptStub = sinon.stub(aes, 'decrypt').returns(privateKey)
    const dummyOutputOfGetWalletCiphers = ['', aesDecryptStub]
    sinon.stub(v2, 'getWalletCiphers').returns(dummyOutputOfGetWalletCiphers)
    // mock Me3._getChainList() response
    mockAxios = new MockAdapter(axios)
    mockAxios.onGet('/api/mainChain/list')
      .reply(200, mockGetChainListResponse)
    me3Ins = new Me3(workableConfig)
  })

  afterEach(() => {
    sinon.restore()
    mockAxios.reset()
  })

  it('should throw when chainName of the provided wallet does not exist in /api/mainChain/list', async () => {
    await expect(
      me3Ins.signTx(
        {
          chainName: 'doge',
          walletName: 'ethereum-1',
          walletAddress: '0xb8272B0eAe5B5Ea681AcB33401b33A2c2D6db351',
          // TODO: This secret is not raw private key, but it is AES encrypted with KR (Keyrecovery file)
          secret: '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db',
        }
        , tx)
    ).to.eventually.be.rejectedWith('Chain not supported')
  })

  it('should throw when chainName of the provided wallet exists in /api/mainChain/list but signing is not implemented yet', async () => {
    // these are dummy data from /fixtures directory
    await expect(
      me3Ins.signTx(
        {
          chainName: 'ltc',
          walletName: 'litecoin-1',
          walletAddress: '0xb8272B0eAe5B5Ea681AcB33401b33A2c2D6db351',
          // TODO: This secret is not raw private key, but it is AES encrypted with KR (Keyrecovery file)
          secret: '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db',
        },
        tx)
    ).to.eventually.be.rejectedWith('Not implemented yet')
  })

  it('should throw when chainName of the provided wallet exists in /api/mainChain/list but signing is not supported', async () => {
    // these are dummy data from /fixtures directory
    await expect(
      me3Ins.signTx(
        {
          chainName: 'moon',
          walletName: 'mooncoin-1',
          walletAddress: '0xb8272B0eAe5B5Ea681AcB33401b33A2c2D6db351',
          // TODO: This secret is not raw private key, but it is AES encrypted with KR (Keyrecovery file)
          secret: '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db',
        },
        tx)
    ).to.eventually.be.rejectedWith('Unsupported series')
  })


  it('should sign tx', async () => {
    const signed = await me3Ins.signTx({
      chainName: 'eth',
      walletName: 'ethereum-1',
      walletAddress: '0xb8272B0eAe5B5Ea681AcB33401b33A2c2D6db351',
      // TODO: This secret is not raw private key, but it is AES encrypted with KR (Keyrecovery file)
      secret: '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db',
    }, tx)

    expect(signed).to.deep.equal('0xf865808080948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a7640000801ca0918e294306d177ab7bd664f5e141436563854ebe0a3e523b9690b4922bbb52b8a01181612cec9c431c4257a79b8c9f0c980a2c49bb5a0e6ac52949163eeb565dfc')
  })
})

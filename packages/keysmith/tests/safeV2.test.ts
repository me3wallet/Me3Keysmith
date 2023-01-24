import { util } from 'node-forge'
import { aes, v1, v2 } from '../src/safeV2'
import * as rsa from '../src/safeV2/rsa'
import * as chacha from '../src/safeV2/chacha'

import { ALICE, RAWKEY } from './env.test'

describe('Safe testing', () => {
  describe('V1 Testing', () => {
    it('V1::encrypt', function () {
      const encrypted = v1.encrypt(
        RAWKEY,
        ALICE.password,
        ALICE.salt,
      )
      expect(encrypted).toEqual(ALICE.key)
    })
    it('V1::decrypt', function () {
      const decrypted = v1.decrypt(
        ALICE.key,
        ALICE.password,
        ALICE.salt,
      )
      expect(decrypted).toEqual(RAWKEY)
    })
  })
  describe('V2 Testing', () => {
    it('AES testing', async function () {
      const plain = 'Hello World'
      const encoded = aes.encrypt(plain, AES_PWD, AES_SALT)
      expect(aes.decrypt(encoded, AES_PWD, AES_SALT)).toEqual(plain)
    })
    it('RSA testing', async function () {
      const key = await rsa.genKeyPair()
      expect(key).toBeTruthy()

      const plain = 'Hello World'
      const encoded = rsa.encrypt(key.publicKey, util.encodeUtf8(plain))
      expect(rsa.decrypt(key.privateKey, encoded)).toEqual(plain)
    })
    it('Chacha testing', () => {
      const plainText = 'Hello world'
      const { keyBytes, b64DataBytes } = chacha.encrypt(util.encodeUtf8(plainText))
      const decrypted = chacha.decrypt(keyBytes, b64DataBytes)
      expect(decrypted).toEqual(plainText)
    })
    it('Enc/Dec testing', async function () {
      const rsaKey = await rsa.genKeyPair(),
        plain = JSON.stringify(BIG_JSON)

      const encrypted = v2.encrypt(plain, {
        aesPwd: AES_PWD,
        aesSalt: AES_SALT,
        rsaKey: rsaKey.publicKey,
        isPubKey: true,
      })
      const decrypted = v2.decrypt(encrypted, {
        aesPwd: AES_PWD,
        aesSalt: AES_SALT,
        rsaKey: rsaKey.privateKey,
        isPubKey: false,
      })
      expect(decrypted).toEqual(plain)
    })
    it('Decrypt server response', async function () {
      const decrypted = v2.decrypt(SERVER_RESP, {
        rsaKey: MY_RSA.privateKey,
        isPubKey: false,
      })
      expect(decrypted).toBeTruthy()
    })
  })
})

const AES_PWD = 'b7f925cf-eb3d-4587-b81b-a17b212cd61d',
  AES_SALT = '3990611c-f057-4c25-bde6-4fe932161a5d',
  MY_RSA = {
    'privateKey': 'MIICXQIBAAKBgQDgK5knaLuED4wfxvDD46LI2QJ9tRd7t0ChrrYu68FuSu8KpBLn49CH8Lkbr+p4L9auVrjibRoELPsMSfaVsmJyRi+MXA0A8NdD65PkUywIuImjCsVe/nSWVRJBCIX3YbMO1DP/V0DI77ebqRKQazxT3lQB5TGoh18jGRl5wEdGOwIDAQABAoGBANRN9jqwogcsglUGILglOuJlREqx24+7umZmBPzjIsrGBSZaxd0AkVptzaI/NRymkfeDAo7PLTiPMSQuWG7mBvzVWlQODu9OcGVY7DZJkZOtQEVA6JNBEONcz/fZs11VJpJAo0+KERyEf+EaUdC40B+cXHlRlA+MqgmClgkUGbXBAkEA8iy9PHDoFDbuBLUGnoIjTgvE3ycQlUPtPzNxU4AAjJ5RP2RJTJtlcEUbZJM0RznSeDd2WuWCxBqJ5POvRFST2QJBAOz3u6uy4BHmUjNqPqQM+mw9nTqwpsSBkKlMr37+101vQFCikl39zrZAidPNy6gStGzgFt/I2fv7TiKUPyZDIjMCQDHx4CUy8+oXWgdGflL6a+WQr82F9PmTxL4gEeMypupZTFBSkntmIQmCdx/K7CE0X5/DcHlWlB11i7LYPvFMsCECQQCkKBnCH/BJdhyLsZYjXzo7sZMyDR36Eyd7oLwSZcgQxHjxYy2yHxkL+DmCmJX0oMCMi9BMxn77qGPAYKI+h1MxAkAYE3pMmfQm2x8KGKxFs+CwNijJPKUeIqziC6KYDq6Xkexl5TXDPiujtqAZhhdDx2fD6tPlzVo+YSEggUZ9wybS',
    'publicKey': 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgK5knaLuED4wfxvDD46LI2QJ9tRd7t0ChrrYu68FuSu8KpBLn49CH8Lkbr+p4L9auVrjibRoELPsMSfaVsmJyRi+MXA0A8NdD65PkUywIuImjCsVe/nSWVRJBCIX3YbMO1DP/V0DI77ebqRKQazxT3lQB5TGoh18jGRl5wEdGOwIDAQAB',
  },
  // SERVER_RSA_PUB = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCzmrAWm9sGnZuFJIzPHa/vzTSDKJF9S0fA+JtMm2quvZQNt6zQNcbLf8udFfCZTay52ZuO8Onh3i0bYys6FpvhsplngLujl0LTyUkiTy/+yOaPUS6vnTATc5+2NflyKRCr/mtIErgt6+threI3tVoIBRdmzxq46+zNJUw91z0FlQIDAQAB',
  SERVER_RESP = {
    'secret': 'nDB4FsOBqE8DLRVWNojQyTVxP1zS1KpQMiipyachtm6SRzu5hUmGmQazJlmTDgRsKC8+yvLaJRDqDTjYf2AoOEIyAkMuosTR7GR1gCK21KANDpG1GqVW7OIIn/A8+ayDaAThFqDVsX6t+q9kY+bjMgwaNdyyq5OP7d/LEXB2TWg=',
    'data': 'SVH0GscEa4JHcDp0xt4J0VGGpRxrskx5IBSTlhQdhiu9vyiwKB+U027PAniUtmO8EBMVGbGj7m/sgn7H8IMSkoOvqPjH+RrO',
  },
  BIG_JSON = {
    'name': 'KyberSwap Token List Arbitrum',
    'keywords': ['dmmexchange', 'kyberswap'],
    'timestamp': '2022-06-20T00:00:00+00:00',
    'logoURI': 'https://kyberswap.com/favicon.png',
    'tokens': [
      {
        'chainId': 42161,
        'address': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        '_scan': 'https://arbiscan.io/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        'symbol': 'USDC',
        'name': 'USDC',
        'decimals': 6,
        'logoURI': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      },
      {
        'chainId': 42161,
        'address': '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        '_scan': 'https://arbiscan.io/token/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        'symbol': 'USDT',
        'name': 'USDT',
        'decimals': 6,
        'logoURI': 'https://coin.top/production/logo/usdtlogo.png',
      },
      {
        'chainId': 42161,
        'address': '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '_scan': 'https://arbiscan.io/token/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        'symbol': 'DAI',
        'name': 'DAI',
        'decimals': 18,
        'logoURI': 'https://assets.coingecko.com/coins/images/9956/large/dai-multi-collateral-mcd.png',
      },
      {
        'chainId': 42161,
        'address': '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        '_scan': 'https://arbiscan.io/token/0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        'symbol': 'WETH',
        'name': 'Wrapped Ether',
        'decimals': 18,
        'logoURI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      },
      {
        'chainId': 42161,
        'address': '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        '_scan': 'https://arbiscan.io/token/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        'symbol': 'WBTC',
        'name': 'WBTC',
        'decimals': 8,
        'logoURI': 'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png',
      },
      {
        'chainId': 42161,
        'address': '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
        '_scan': 'https://arbiscan.io/token/0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
        'symbol': 'MIM',
        'name': 'Magic Internet Money',
        'decimals': 18,
        'logoURI': 'https://s2.coinmarketcap.com/static/img/coins/64x64/162.png',
      },
      {
        'chainId': 42161,
        'address': '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
        '_scan': 'https://arbiscan.io/token/0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
        'decimals': 18,
        'name': 'MAI',
        'symbol': 'MAI',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/MAI.svg',
      },
      {
        'chainId': 42161,
        'address': '0x9d2f299715d94d8a7e6f5eaa8e654e8c74a988a7',
        '_scan': 'https://arbiscan.io/token/0x9d2f299715d94d8a7e6f5eaa8e654e8c74a988a7',
        'decimals': 18,
        'name': 'Frax Share',
        'symbol': 'FXS',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/FXS.svg',
      },
      {
        'chainId': 42161,
        'address': '0x080f6aed32fc474dd5717105dba5ea57268f46eb',
        '_scan': 'https://arbiscan.io/token/0x080f6aed32fc474dd5717105dba5ea57268f46eb',
        'decimals': 18,
        'name': 'Synapse',
        'symbol': 'SYN',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/SYN.svg',
      },
      {
        'chainId': 42161,
        'address': '0x319f865b287fcc10b30d8ce6144e8b6d1b476999',
        '_scan': 'https://arbiscan.io/token/0x319f865b287fcc10b30d8ce6144e8b6d1b476999',
        'decimals': 18,
        'name': 'Cartesi',
        'symbol': 'CTSI',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/CTSI.png',
      },
      {
        'chainId': 42161,
        'address': '0x9fb9a33956351cf4fa040f65a13b835a3c8764e3',
        '_scan': 'https://arbiscan.io/token/0x9fb9a33956351cf4fa040f65a13b835a3c8764e3',
        'decimals': 18,
        'name': 'Multchain',
        'symbol': 'MULTI',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/MULTI.png',
      },
      {
        'chainId': 42161,
        'address': '0x6694340fc020c5e6b96567843da2df01b2ce1eb6',
        '_scan': 'https://arbiscan.io/token/0x6694340fc020c5e6b96567843da2df01b2ce1eb6',
        'decimals': 18,
        'name': 'Stargate Finance',
        'symbol': 'STG',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/STG.svg',
      },
      {
        'chainId': 42161,
        'address': '0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae',
        '_scan': 'https://arbiscan.io/token/0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae',
        'decimals': 18,
        'name': 'Beefy.Finance',
        'symbol': 'BIFI',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/BIFI.png',
      },
      {
        'chainId': 42161,
        'address': '0x68ead55c258d6fa5e46d67fc90f53211eab885be',
        '_scan': 'https://arbiscan.io/token/0x68ead55c258d6fa5e46d67fc90f53211eab885be',
        'decimals': 18,
        'name': 'Popcorn',
        'symbol': 'POP',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/POP.png',
      },
      {
        'chainId': 42161,
        'address': '0xd74f5255d557944cf7dd0e45ff521520002d5748',
        '_scan': 'https://arbiscan.io/token/0xd74f5255d557944cf7dd0e45ff521520002d5748',
        'decimals': 18,
        'name': 'Sperax USD',
        'symbol': 'USDS',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/USDS.svg',
      },
      {
        'chainId': 42161,
        'address': '0xee9801669c6138e84bd50deb500827b776777d28',
        '_scan': 'https://arbiscan.io/token/0xee9801669c6138e84bd50deb500827b776777d28',
        'decimals': 18,
        'name': 'O3 Swap',
        'symbol': 'O3',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/O3.png',
      },
      {
        'chainId': 42161,
        'address': '0x21e60ee73f17ac0a411ae5d690f908c3ed66fe12',
        '_scan': 'https://arbiscan.io/token/0x21e60ee73f17ac0a411ae5d690f908c3ed66fe12',
        'decimals': 18,
        'name': 'Deri Protocol',
        'symbol': 'DERI',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/DERI.svg',
      },
      {
        'chainId': 42161,
        'address': '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
        '_scan': 'https://arbiscan.io/token/0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
        'decimals': 18,
        'name': 'GMX',
        'symbol': 'GMX',
        'logoURI': 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/GMX.svg',
      },
    ],
    'version': {
      'major': 1,
      'minor': 0,
      'patch': 1,
    },
  }

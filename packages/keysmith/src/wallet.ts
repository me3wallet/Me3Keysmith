import {
  cryptoIsReady,
  cryptoWaitReady,
  encodeAddress,
  mnemonicToMiniSecret,
  sr25519PairFromSeed,
} from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import { FilecoinSigner } from '@blitslabs/filecoin-js-signer'
import { ethers } from 'ethers'

export default async function createWallet(series: string, mnemonic: string) {
  switch (series) {
    case 'btc':
    case 'ltc':
    case 'bch':
      return _createBtcWallet(series, mnemonic)

    case 'eth': {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic)
      return {
        walletAddress: wallet.address,
        secretRaw: wallet.privateKey,
      }
    }
    case 'dot': {
      if (!cryptoIsReady()) {
        await cryptoWaitReady()
      }
      const mini = mnemonicToMiniSecret(mnemonic)
      const { publicKey, secretKey } = sr25519PairFromSeed(mini)
      return {
        walletAddress: encodeAddress(publicKey),
        secretRaw: u8aToHex(secretKey),
      }
    }
    case 'fil': {
      const signer = new FilecoinSigner()
      const key = await signer.wallet.keyDerive(
        mnemonic,
        'm/44\'/461\'/0\'/0/0',
        'mainnet'
      )
      return {
        walletAddress: key.address,
        secretRaw: key.privateKey,
      }
    }
    default:
      break
  }
  return undefined
}

function _createBtcWallet(series: string, mnemonic: string) {
  let generator: any
  switch (series) {
    case 'btc':
      generator = require('bitcore-lib')
      break
    case 'ltc':
      generator = require('bitcore-lib-ltc')
      break
    case 'bch':
      generator = require('bitcore-lib-cash')
      break
    default:
      return undefined
  }

  const value = Buffer.from(mnemonic, 'utf8')
  const hash = generator.crypto.Hash.sha256(value)
  const bn = generator.crypto.BN.fromBuffer(hash)
  const privateKey = new generator.PrivateKey(bn)
  return {
    walletAddress: privateKey.toAddress().toString(),
    secretRaw: privateKey.toString(),
  }
}

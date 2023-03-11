import {
  cryptoIsReady,
  cryptoWaitReady,
  encodeAddress,
  mnemonicToMiniSecret,
  sr25519PairFromSeed,
} from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import { ethers } from 'ethers'

import { createFileCoinWallet } from './wallet/create-wallet/filecoin'
import { createBtcWallet } from './wallet/create-wallet/bitcoin'
import { getWalletName } from './wallet/create-wallet/common'

export default async function createWallet(companyChain, mnemonic: string) {
  const [series, chains] = companyChain
  switch (series) {
  case 'btc':
  case 'ltc':
  case 'bch':
    return createBtcWallet(series, mnemonic)

  case 'eth': {
    return chains.map(c => {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, c.path)
      return {
        walletAddress: wallet.address,
        secretRaw: wallet.privateKey,
        chainName: c.name,
        walletName: getWalletName(c.description),
      }
    })
  }
  case 'dot': {
    if (!cryptoIsReady()) {
      await cryptoWaitReady()
    }
    const mini = mnemonicToMiniSecret(mnemonic)
    const { publicKey, secretKey } = sr25519PairFromSeed(mini)
    const walletAddress = encodeAddress(publicKey)
    const secretRaw = u8aToHex(secretKey)

    return chains.map(c => {
      return {
        walletAddress,
        secretRaw,
        chainName: c.name,
        walletName: getWalletName(c.description),
      }
    })
  }
  case 'fil':
  case 'filtest': {
    return createFileCoinWallet(chains, mnemonic)
  }
  default:
    break
  }
  return undefined
}


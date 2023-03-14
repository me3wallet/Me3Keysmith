import _ from 'lodash'
import signer from '@zondax/filecoin-signing-tools'
import { getWalletName } from './common'

export const createFileCoinWallet = (chains: [any], mnemonic: string) => chains.map(c => {
  const key = signer.keyDerive(
    mnemonic,
    c.path,
    _.toLower(c.name) === 'fil' ? 'mainnet' : 'testnet'
  )

  return {
    walletAddress: key.address,
    secretRaw: key.private_base64,
    walletName: getWalletName(c.description),
    chainName: c.name,
  }
})
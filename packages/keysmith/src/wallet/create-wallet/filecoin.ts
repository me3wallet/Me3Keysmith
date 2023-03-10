import * as signer from '@zondax/filecoin-signing-tools'

export const createFileCoinWallet = (chains: [any], mnemonic: string) => chains.map(c => {
  const key = signer.keyDerive(
    mnemonic,
    c.path,
    c.name === 'fil' ? 'mainnet' : 'testnet'
  )

  return {
    walletAddress: key.address,
    secretRaw: key.private_base64,
    walletName: c.walletName,
    chainName: c.name,
  }
})
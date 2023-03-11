import _ from 'lodash'

export const createBtcWallet = (chains: [any], mnemonic: string) => _.chain(chains)
  .map(c => {
    const generator = getGenerator(c.series)
    if (_.isEmpty(generator)) {
      return undefined
    }

    const value = Buffer.from(mnemonic, 'utf8')
    const hash = generator.crypto.Hash.sha256(value)
    const bn = generator.crypto.BN.fromBuffer(hash)
    const privateKey = new generator.PrivateKey(bn)
    return {
      walletAddress: privateKey.toAddress().toString(),
      secretRaw: privateKey.toString(),
      walletName: c.walletName,
      chainName: c.name,
    }
  })
  .compact()
  .value()

const getGenerator = (series: string) => {
  switch (_.toLower(series)) {
  case 'btc':
    return require('bitcore-lib')
  case 'ltc':
    return require('bitcore-lib-ltc')
    break
  case 'bch':
    return require('bitcore-lib-cash')
    break
  default:
    break
  }
  return undefined
}
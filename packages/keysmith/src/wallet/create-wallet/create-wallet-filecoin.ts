import * as signer from '@zondax/filecoin-signing-tools'

import { WalletRaw } from '../../types'

export const createWalletFilecoin = (mnemonic: string): WalletRaw => {
    const key = signer.keyDerive(
        mnemonic,
        'm/44\'/461\'/0\'/0/0',
        'mainnet'
    )

    return {
        walletAddress: key.address,
        secretRaw: key.private_base64,
    }
}
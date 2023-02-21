import { ethers } from 'ethers'

import { TransactionRequest } from './domain'

export const performSignEvmTransaction = async (
    privateKey: string,
    transactionRequest: TransactionRequest
): Promise<string> => {
    let wallet
    try {
        wallet = new ethers.Wallet(privateKey)
    } catch (error) {
        throw new Error('Invalid privateKey provided')
    }

    return await wallet.signTransaction(transactionRequest)
}

export default {
    performSignEvmTransaction,
}
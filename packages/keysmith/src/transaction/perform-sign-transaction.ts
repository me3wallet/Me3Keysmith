import { ethers } from 'ethers'

import { TransactionRequest } from './domain'

export const performSignEthTransaction = async (
    privateKey: string,
    transactionRequest: TransactionRequest
): Promise<string> => {
    const wallet = new ethers.Wallet(privateKey)
    return wallet.signTransaction(transactionRequest)
}

export default {
    performSignEthTransaction,
}
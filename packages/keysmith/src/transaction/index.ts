import { performSignEthTransaction } from './perform-sign-transaction'
import { SignTransactionParams } from './domain'

export const signTransaction = async ({
    series,
    privateKey,
    transactionRequest,
}: SignTransactionParams): Promise<string | void> => {
    switch (series) {
        case 'eth': {
            return await performSignEthTransaction(privateKey, transactionRequest)
        }
        case 'ltc':
        case 'bch':
        case 'btc':
        case 'fil':
        case 'dot': {
            throw new Error('Not implemented yet')
        }
        default: {
            throw new Error('Unsupported series')
        }
    }
}

export default {
    signTransaction,
}
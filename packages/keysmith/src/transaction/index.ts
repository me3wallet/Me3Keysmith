import { performSignEvmTransaction } from './perform-sign-transaction'
import { SignTransactionParams } from './domain'

export const signTransaction = async ({
    series,
    privateKey,
    transactionRequest,
}: SignTransactionParams): Promise<string> => {
    console.log('signTransaction::transactionRequest to sign', transactionRequest)

    switch (series.toLowerCase()) {
        case 'avax':
        case 'bsc':
        case 'matic':
        case 'eth': {
            return await performSignEvmTransaction(privateKey, transactionRequest)
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
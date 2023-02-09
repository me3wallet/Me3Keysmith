/**
 * Please provide params required to execute transactions on the blockchain of your choice
 */
export type TransactionRequest = Record<string, any>

/**
 * WalletData interface is the shape of each wallet object returned by me3.getWallets() method
 */
export interface WalletData {
    chainName: string;
    secret: string;
    [key: string]: any;
}

export interface SignTransactionParams {
    privateKey: string,
    series: string,
    transactionRequest: TransactionRequest,
}
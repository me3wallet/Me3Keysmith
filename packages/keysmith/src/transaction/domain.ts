/**
 * Please provide params required to execute transactions on the blockchain of your choice
 */
export type TransactionRequest = Record<string, any>

export interface SignTransactionParams {
    privateKey: string,
    series: string,
    transactionRequest: TransactionRequest,
}
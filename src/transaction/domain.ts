/**
 * Please provide params required to execute transactions on the blockchain of your choice
 */
export type TransactionRequest = Record<string, any>

export interface SignTransactionParams {
    series: string,
    privateKey: string,
    transactionRequest: TransactionRequest
}

export interface Utxo {
    txId: string;
    outputIndex: number;
    address: string;
    script: string;
    satoshis: number;
}

export interface BtcTransactionRequestParams {
    utxo: Utxo[];
    to: string;
}
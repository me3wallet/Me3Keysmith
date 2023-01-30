export type TransactionRequest = Record<string, any>;
export interface WalletData {
    chainName: string;
    secret: string;
    [key: string]: any;
}
export interface SignTransactionParams {
    privateKey: string;
    series: string;
    transactionRequest: TransactionRequest;
}

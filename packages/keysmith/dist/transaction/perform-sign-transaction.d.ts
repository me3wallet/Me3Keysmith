import { TransactionRequest } from './domain'
export declare const performSignEvmTransaction: (privateKey: string, transactionRequest: TransactionRequest) => Promise<string>
declare const _default: {
    performSignEvmTransaction: (privateKey: string, transactionRequest: TransactionRequest) => Promise<string>;
}
export default _default

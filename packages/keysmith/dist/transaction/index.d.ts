import { SignTransactionParams } from './domain'
export declare const signTransaction: ({ series, privateKey, transactionRequest }: SignTransactionParams) => Promise<string>
declare const _default: {
    signTransaction: ({ series, privateKey, transactionRequest }: SignTransactionParams) => Promise<string>;
}
export default _default

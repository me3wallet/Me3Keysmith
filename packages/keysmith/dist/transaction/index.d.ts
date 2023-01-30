import { SignTransactionParams } from './domain';
export declare const signTransaction: ({ series, privateKey, transactionRequest, }: SignTransactionParams) => Promise<string | void>;
declare const _default: {
    signTransaction: ({ series, privateKey, transactionRequest, }: SignTransactionParams) => Promise<string | void>;
};
export default _default;

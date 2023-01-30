import { TransactionRequest } from './domain';
export declare const performSignEthTransaction: (privateKey: string, transactionRequest: TransactionRequest) => Promise<string>;
declare const _default: {
    performSignEthTransaction: (privateKey: string, transactionRequest: TransactionRequest) => Promise<string>;
};
export default _default;

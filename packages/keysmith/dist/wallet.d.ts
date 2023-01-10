export default function createWallet(series: string, mnemonic: string): Promise<{
    walletAddress: any;
    secretRaw: any;
}>;

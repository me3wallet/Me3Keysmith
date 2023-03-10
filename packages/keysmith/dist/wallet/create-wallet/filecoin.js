"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.createFileCoinWallet = void 0;
var signer = __importStar(require("@zondax/filecoin-signing-tools"));
var createFileCoinWallet = function (chains, mnemonic) { return chains.map(function (c) {
    var key = signer.keyDerive(mnemonic, c.path, c.name === 'fil' ? 'mainnet' : 'testnet');
    return {
        walletAddress: key.address,
        secretRaw: key.private_base64,
        walletName: c.walletName,
        chainName: c.name
    };
}); };
exports.createFileCoinWallet = createFileCoinWallet;
//# sourceMappingURL=filecoin.js.map
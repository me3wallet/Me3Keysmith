"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createFileCoinWallet = void 0;
var lodash_1 = __importDefault(require("lodash"));
var filecoin_signing_tools_1 = require("@zondax/filecoin-signing-tools");
var common_1 = require("./common");
var createFileCoinWallet = function (chains, mnemonic) { return chains.map(function (c) {
    var key = (0, filecoin_signing_tools_1.keyDerive)(mnemonic, c.path, lodash_1["default"].toLower(c.name) === 'fil' ? 'mainnet' : 'testnet');
    return {
        walletAddress: key.address,
        secretRaw: key.private_base64,
        walletName: (0, common_1.getWalletName)(c.description),
        chainName: c.name
    };
}); };
exports.createFileCoinWallet = createFileCoinWallet;
//# sourceMappingURL=filecoin.js.map
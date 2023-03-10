"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createBtcWallet = void 0;
var lodash_1 = __importDefault(require("lodash"));
var createBtcWallet = function (chains, mnemonic) { return lodash_1["default"].chain(chains)
    .map(function (c) {
    var generator = getGenerator(c.series);
    if (lodash_1["default"].isEmpty(generator)) {
        return undefined;
    }
    var value = Buffer.from(mnemonic, 'utf8');
    var hash = generator.crypto.Hash.sha256(value);
    var bn = generator.crypto.BN.fromBuffer(hash);
    var privateKey = new generator.PrivateKey(bn);
    return {
        walletAddress: privateKey.toAddress().toString(),
        secretRaw: privateKey.toString(),
        walletName: c.walletName,
        chainName: c.name
    };
})
    .compact()
    .value(); };
exports.createBtcWallet = createBtcWallet;
var getGenerator = function (series) {
    switch (series) {
        case 'btc':
            return require('bitcore-lib');
        case 'ltc':
            return require('bitcore-lib-ltc');
            break;
        case 'bch':
            return require('bitcore-lib-cash');
            break;
        default:
            break;
    }
    return undefined;
};
//# sourceMappingURL=bitcoin.js.map
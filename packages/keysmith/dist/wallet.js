"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var util_crypto_1 = require("@polkadot/util-crypto");
var util_1 = require("@polkadot/util");
var ethers_1 = require("ethers");
var create_wallet_filecoin_1 = require("./wallet/create-wallet/create-wallet-filecoin");
function createWallet(series, mnemonic) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, wallet, mini, _b, publicKey, secretKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = series;
                    switch (_a) {
                        case 'btc': return [3, 1];
                        case 'ltc': return [3, 1];
                        case 'bch': return [3, 1];
                        case 'eth': return [3, 2];
                        case 'dot': return [3, 3];
                        case 'fil': return [3, 6];
                    }
                    return [3, 7];
                case 1: return [2, _createBtcWallet(series, mnemonic)];
                case 2:
                    {
                        wallet = ethers_1.ethers.Wallet.fromMnemonic(mnemonic);
                        return [2, {
                                walletAddress: wallet.address,
                                secretRaw: wallet.privateKey
                            }];
                    }
                    _c.label = 3;
                case 3:
                    if (!!(0, util_crypto_1.cryptoIsReady)()) return [3, 5];
                    return [4, (0, util_crypto_1.cryptoWaitReady)()];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    mini = (0, util_crypto_1.mnemonicToMiniSecret)(mnemonic);
                    _b = (0, util_crypto_1.sr25519PairFromSeed)(mini), publicKey = _b.publicKey, secretKey = _b.secretKey;
                    return [2, {
                            walletAddress: (0, util_crypto_1.encodeAddress)(publicKey),
                            secretRaw: (0, util_1.u8aToHex)(secretKey)
                        }];
                case 6:
                    {
                        return [2, (0, create_wallet_filecoin_1.createWalletFilecoin)(mnemonic)];
                    }
                    _c.label = 7;
                case 7: return [3, 8];
                case 8: return [2, undefined];
            }
        });
    });
}
exports["default"] = createWallet;
function _createBtcWallet(series, mnemonic) {
    var generator;
    switch (series) {
        case 'btc':
            generator = require('bitcore-lib');
            break;
        case 'ltc':
            generator = require('bitcore-lib-ltc');
            break;
        case 'bch':
            generator = require('bitcore-lib-cash');
            break;
        default:
            return undefined;
    }
    var value = Buffer.from(mnemonic, 'utf8');
    var hash = generator.crypto.Hash.sha256(value);
    var bn = generator.crypto.BN.fromBuffer(hash);
    var privateKey = new generator.PrivateKey(bn);
    return {
        walletAddress: privateKey.toAddress().toString(),
        secretRaw: privateKey.toString()
    };
}
//# sourceMappingURL=wallet.js.map
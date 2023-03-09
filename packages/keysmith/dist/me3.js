"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var lodash_1 = __importDefault(require("lodash"));
var randomstring_1 = __importDefault(require("randomstring"));
var bip39 = __importStar(require("bip39"));
var axios_1 = __importDefault(require("axios"));
var types_1 = require("./types");
var wallet_1 = __importDefault(require("./wallet"));
var google_1 = __importDefault(require("./google"));
var safeV2_1 = require("./safeV2");
var transaction_1 = require("./transaction");
var Me3 = (function () {
    function Me3(credential) {
        this._client = axios_1["default"].create({
            baseURL: credential.endpoint
        });
        var companyHeader = {
            'Company-ID': 2000,
            'Partner-ID': credential.partnerId
        };
        var _this = this;
        this._client.interceptors.request.use(function (config) {
            var _a;
            var chain = lodash_1["default"].chain(companyHeader).pickBy(lodash_1["default"].identity);
            if (!lodash_1["default"].isEmpty((_a = _this._apiToken) === null || _a === void 0 ? void 0 : _a.kc_access)) {
                chain = chain.set('Authorization', "Bearer ".concat(_this._apiToken.kc_access));
            }
            config.headers = chain.merge(config.headers).value();
            return config;
        });
        this._client.interceptors.response.use(function (resp) {
            var data = resp.data.data;
            var isCipherBody = lodash_1["default"].every(['data', 'secret'], lodash_1["default"].partial(lodash_1["default"].has, data));
            if (isCipherBody) {
                data = _this.decryptData(data, false);
            }
            resp.data = data;
            return resp;
        }, function (err) {
            var status = err.response ? err.response.status : null;
            if (status === 401) {
                return _this._refreshToken().then(function (_) {
                    err.config.headers['Authorization'] = "Bearer ".concat(_this._apiToken.kc_access);
                    return _this._client.request(err.config);
                });
            }
            return Promise.reject(err);
        });
    }
    Me3.prototype.me3ApiClient = function () {
        return this._client;
    };
    Me3.prototype.isInitialized = function () {
        if (lodash_1["default"].isEmpty(this._apiToken)) {
            return false;
        }
        if (lodash_1["default"].isEmpty(this._userSecret)) {
            return false;
        }
        if (lodash_1["default"].isEmpty(this._myPriRsa)) {
            return false;
        }
        if (lodash_1["default"].isEmpty(this._serverPubRsa)) {
            return false;
        }
        return true;
    };
    Me3.prototype.getAuthLink = function (redirectURL) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, privateKey, publicKey, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = safeV2_1.rsa.genKeyPair(), privateKey = _a.privateKey, publicKey = _a.publicKey;
                        this._myPriRsa = privateKey;
                        return [4, this._client.get('/kc/auth/link', {
                                params: {
                                    redirectURL: redirectURL,
                                    pubKey: publicKey
                                }
                            })];
                    case 1:
                        data = (_b.sent()).data;
                        return [2, data];
                }
            });
        });
    };
    Me3.prototype.getAuthToken = function (code, state, sessionState) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._client.get('/kc/auth/code', {
                            params: {
                                code: code,
                                state: state,
                                session_state: sessionState
                            }
                        })];
                    case 1:
                        data = (_a.sent()).data;
                        this._apiToken = data;
                        this._gClient = new google_1["default"](this._apiToken.google_access);
                        return [2, true];
                }
            });
        });
    };
    Me3.prototype.getWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, krFileId, isNewUser, cipher, wallets, _i, wallets_1, w;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (lodash_1["default"].isEmpty(this._apiToken)) {
                            throw Error('Error! Operation failed.Please contact me3 team!');
                        }
                        return [4, this._getUserProfile()];
                    case 1:
                        _a = _b.sent(), email = _a.email, krFileId = _a.krFileId;
                        return [4, this._loadBackupFile(krFileId)];
                    case 2:
                        isNewUser = _b.sent();
                        if (!!isNewUser) return [3, 4];
                        console.log("Already exist, Restore wallets for ".concat(email, "!"));
                        return [4, this._loadWallets()];
                    case 3: return [2, _b.sent()];
                    case 4:
                        console.log("New User, Create wallets for ".concat(email, "!"));
                        cipher = safeV2_1.v2.getWalletCiphers(this._userSecret)[0];
                        return [4, this._createWallets().then(function (wallets) { return lodash_1["default"].map(wallets, function (w) { return ({
                                chainName: w.chainName,
                                walletName: w.walletName,
                                walletAddress: w.walletAddress,
                                secret: cipher(w.secretRaw)
                            }); }); })];
                    case 5:
                        wallets = _b.sent();
                        _i = 0, wallets_1 = wallets;
                        _b.label = 6;
                    case 6:
                        if (!(_i < wallets_1.length)) return [3, 9];
                        w = wallets_1[_i];
                        return [4, Promise.all([
                                this._client.post('/api/light/addWallet', this.encryptData(__assign(__assign({}, w), { needFocus: true }))),
                                this._client.post('/api/mainChain/ping', null, {
                                    params: {
                                        chainName: w.chainName,
                                        status: 3
                                    }
                                }),
                            ])];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        _i++;
                        return [3, 6];
                    case 9: return [2, wallets];
                }
            });
        });
    };
    Me3.prototype.encryptData = function (data, withAES) {
        if (withAES === void 0) { withAES = false; }
        var secure = {
            rsaKey: this._apiToken.rsaPubKey,
            isPubKey: true
        };
        if (withAES === true && !lodash_1["default"].isEmpty(this._userSecret)) {
            var _a = this._userSecret, password = _a.password, key = _a.key, salt = _a.salt;
            var decryptedKey = safeV2_1.aes.decrypt(key, password, salt);
            lodash_1["default"].merge(secure, {
                aesKey: decryptedKey,
                aesSalt: salt
            });
        }
        return safeV2_1.v2.encrypt(JSON.stringify(data), secure);
    };
    Me3.prototype.decryptData = function (data, withAES) {
        if (withAES === void 0) { withAES = false; }
        var secure = {
            rsaKey: this._myPriRsa,
            isPubKey: false
        };
        if (withAES === true && !lodash_1["default"].isEmpty(this._userSecret)) {
            var _a = this._userSecret, password = _a.password, key = _a.key, salt = _a.salt;
            var decryptedKey = safeV2_1.aes.decrypt(key, password, salt);
            lodash_1["default"].merge(secure, {
                aesKey: decryptedKey,
                aesSalt: salt
            });
        }
        var decrypted = safeV2_1.v2.decrypt(data, secure);
        return JSON.parse(decrypted);
    };
    Me3.prototype.signTx = function (wallet, txRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var chains, chainFound, _a, decipher;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this._getChainList()];
                    case 1:
                        chains = _b.sent();
                        chainFound = lodash_1["default"].chain(chains)
                            .filter(function (c) { return lodash_1["default"].toLower(c.name) === lodash_1["default"].toLower(wallet.chainName); })
                            .head()
                            .value();
                        if (lodash_1["default"].isEmpty(chainFound)) {
                            throw Error('Chain not supported');
                        }
                        _a = safeV2_1.v2.getWalletCiphers(this._userSecret), decipher = _a[1];
                        return [4, (0, transaction_1.signTransaction)({
                                series: chainFound.series,
                                privateKey: decipher(wallet.secret),
                                transactionRequest: txRequest
                            })];
                    case 2: return [2, _b.sent()];
                }
            });
        });
    };
    Me3.prototype._getChainList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chains;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._client.get('/api/mainChain/list')];
                    case 1:
                        chains = (_a.sent()).data;
                        return [2, chains];
                }
            });
        });
    };
    Me3.prototype._createWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chains, refined, mnemonic, wallets, _loop_1, _i, _a, _b, key, list;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, this._getChainList()];
                    case 1:
                        chains = _c.sent();
                        refined = lodash_1["default"].reduce(chains, function (result, acc) {
                            var list = result[lodash_1["default"].toLower(acc.series)] || [];
                            list.push({
                                chainName: acc.name,
                                walletName: lodash_1["default"].trim("3rd_".concat(acc.description))
                            });
                            result[lodash_1["default"].toLower(acc.series)] = list;
                            return result;
                        }, {});
                        mnemonic = bip39.generateMnemonic();
                        wallets = new Array();
                        _loop_1 = function (key, list) {
                            var wallet;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: return [4, (0, wallet_1["default"])(key, mnemonic)];
                                    case 1:
                                        wallet = _d.sent();
                                        if (!lodash_1["default"].isEmpty(wallet)) {
                                            wallets.push(lodash_1["default"].map(list, function (it) { return lodash_1["default"].merge(it, wallet); }));
                                        }
                                        return [2];
                                }
                            });
                        };
                        _i = 0, _a = lodash_1["default"].entries(refined);
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3, 5];
                        _b = _a[_i], key = _b[0], list = _b[1];
                        return [5, _loop_1(key, list)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3, 2];
                    case 5: return [2, lodash_1["default"].flatten(wallets)];
                }
            });
        });
    };
    Me3.prototype._loadWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._client.get('/api/light/secretList')];
                    case 1:
                        data = (_a.sent()).data;
                        return [2, lodash_1["default"].map(data, function (w) { return ({
                                chainName: w.chainName,
                                walletName: w.walletName,
                                walletAddress: w.walletAddress,
                                secret: w.secret
                            }); })];
                }
            });
        });
    };
    Me3.prototype._loadBackupFile = function (krFileId) {
        return __awaiter(this, void 0, void 0, function () {
            var updateGFileId, _a, _b, uid, password, salt, randStr, key, secret, jsonStr, jsonId;
            var _this_1 = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        updateGFileId = function (fileId) { return __awaiter(_this_1, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2, this._client.post('/api/light/userfileId', null, {
                                        params: { fileId: fileId }
                                    }).then(function (resp) { return lodash_1["default"].get(resp, 'data.fileId'); })];
                            });
                        }); };
                        if (!!lodash_1["default"].isEmpty(krFileId)) return [3, 2];
                        _a = this;
                        return [4, this._gClient.loadFile(krFileId)];
                    case 1:
                        _a._userSecret = _c.sent();
                        return [2, false];
                    case 2:
                        _b = this._apiToken, uid = _b.uid, password = _b.password, salt = _b.salt;
                        if (lodash_1["default"].isNil(uid) || lodash_1["default"].isNil(password) || lodash_1["default"].isNil(salt)) {
                            throw Error('No KR info!');
                        }
                        randStr = randomstring_1["default"].generate({
                            charset: 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
                            length: 40
                        });
                        key = safeV2_1.aes.encrypt("".concat(randStr).concat(new Date().getTime()), password, salt);
                        secret = lodash_1["default"].pickBy({ uid: uid, password: password, salt: salt, key: key }, lodash_1["default"].identity);
                        jsonStr = JSON.stringify(secret);
                        return [4, Promise.all([
                                this._gClient.saveFile(this._gClient.str2Readable(jsonStr), types_1.DriveName.json, 'application/json'),
                            ])];
                    case 3:
                        jsonId = (_c.sent())[0];
                        return [4, updateGFileId(jsonId)];
                    case 4:
                        _c.sent();
                        this._userSecret = secret;
                        return [2, true];
                }
            });
        });
    };
    Me3.prototype._refreshToken = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (lodash_1["default"].isEmpty((_a = this._apiToken) === null || _a === void 0 ? void 0 : _a.kc_refresh)) {
                            return [2, false];
                        }
                        return [4, axios_1["default"].post("".concat(this._client.defaults.baseURL, "/kc/auth/refresh"), { refresh: (_b = this._apiToken) === null || _b === void 0 ? void 0 : _b.kc_refresh })];
                    case 1:
                        data = (_c.sent()).data;
                        this._apiToken = this.decryptData(data.data, false);
                        return [2, true];
                }
            });
        });
    };
    Me3.prototype._getUserProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._client.get('/kc/api/userInfo')];
                    case 1:
                        data = (_a.sent()).data;
                        return [2, data];
                }
            });
        });
    };
    return Me3;
}());
exports["default"] = Me3;
//# sourceMappingURL=me3.js.map
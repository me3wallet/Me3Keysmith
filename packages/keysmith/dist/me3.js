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
var path_1 = __importDefault(require("path"));
var lodash_1 = __importDefault(require("lodash"));
var qr_with_logo_1 = __importDefault(require("qr-with-logo"));
var randomstring_1 = __importDefault(require("randomstring"));
var bip39 = __importStar(require("bip39"));
var axios_1 = __importDefault(require("axios"));
var types_1 = require("./types");
var wallet_1 = __importDefault(require("./wallet"));
var google_1 = __importDefault(require("./google"));
var safeV2_1 = require("./safeV2");
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
            var chain = lodash_1["default"].chain(companyHeader)
                .pickBy(lodash_1["default"].identity);
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
            var _a, email, krFileId, isNewUser, wallets, _b, key, salt, password, decryptedKey, _i, wallets_1, w, encrypted;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (lodash_1["default"].isEmpty(this._apiToken)) {
                            throw Error('Error! Operation failed.Please contact me3 team!');
                        }
                        return [4, this._getUserProfile()];
                    case 1:
                        _a = _c.sent(), email = _a.email, krFileId = _a.krFileId;
                        return [4, this._loadBackupFile(krFileId)];
                    case 2:
                        isNewUser = _c.sent();
                        if (!!isNewUser) return [3, 4];
                        console.log("Already exist, Restore wallets for ".concat(email, "!"));
                        return [4, this._loadWallets()];
                    case 3: return [2, _c.sent()];
                    case 4:
                        console.log("New User, Create wallets for ".concat(email, "!"));
                        return [4, this._createWallets()];
                    case 5:
                        wallets = _c.sent();
                        _b = this._userSecret, key = _b.key, salt = _b.salt, password = _b.password;
                        decryptedKey = safeV2_1.aes.decrypt(key, password, salt);
                        _i = 0, wallets_1 = wallets;
                        _c.label = 6;
                    case 6:
                        if (!(_i < wallets_1.length)) return [3, 9];
                        w = wallets_1[_i];
                        encrypted = this.encryptData({
                            chainName: w.chainName,
                            walletName: w.walletName,
                            walletAddress: w.walletAddress,
                            secret: safeV2_1.aes.encrypt(w.secretRaw, decryptedKey, salt),
                            needFocus: true
                        });
                        return [4, Promise.all([
                                this._client.post('/api/light/addWallet', encrypted),
                                this._client.post('/api/mainChain/ping', null, {
                                    params: {
                                        chainName: w.chainName,
                                        status: 3
                                    }
                                }),
                            ])];
                    case 7:
                        _c.sent();
                        _c.label = 8;
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
    Me3.prototype._generateQR = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var logoPath;
            return __generator(this, function (_a) {
                logoPath = path_1["default"].join(__dirname, '../res', 'logo.png');
                return [2, new Promise(function (res, rej) {
                        qr_with_logo_1["default"].generateQRWithLogo(content, logoPath, { errorCorrectionLevel: 'M' }, 'Base64', 'qr.png', function (b64) { return res(b64); })["catch"](rej);
                    })];
            });
        });
    };
    Me3.prototype._createWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chains, refined, mnemonic, wallets, _loop_1, _i, _a, _b, key, list;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, this._client.get('/api/mainChain/list')];
                    case 1:
                        chains = (_c.sent()).data;
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
            var _a, password, key, salt, decryptedKey, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._userSecret, password = _a.password, key = _a.key, salt = _a.salt;
                        decryptedKey = safeV2_1.aes.decrypt(key, password, salt);
                        return [4, this._client.get('/api/light/secretList')];
                    case 1:
                        data = (_b.sent()).data;
                        return [2, lodash_1["default"].chain(data)
                                .map(function (w) {
                                try {
                                    return {
                                        chainName: w.chainName,
                                        walletName: w.walletName,
                                        walletAddress: w.walletAddress,
                                        secret: safeV2_1.aes.decrypt(w.secret, decryptedKey, salt)
                                    };
                                }
                                catch (e) {
                                    console.log("Wallet - [".concat(w.chainName, "::").concat(w.walletName, "::").concat(w.walletAddress, " decryption failed"), lodash_1["default"].get(e, 'message'));
                                }
                                return undefined;
                            })
                                .compact()
                                .value()];
                }
            });
        });
    };
    Me3.prototype._loadBackupFile = function (krFileId) {
        return __awaiter(this, void 0, void 0, function () {
            var updateGFileId, _a, _b, uid, password, salt, randStr, key, secret, jsonStr, qrCode, _c, jsonId;
            var _this_1 = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
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
                        _a._userSecret = _d.sent();
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
                        return [4, this._generateQR(jsonStr)];
                    case 3:
                        qrCode = _d.sent();
                        return [4, Promise.all([
                                this._gClient.saveFile(this._gClient.b642Readable(qrCode), types_1.DriveName.qr, 'image/png'),
                                this._gClient.saveFile(this._gClient.str2Readable(jsonStr), types_1.DriveName.json, 'application/json'),
                            ])];
                    case 4:
                        _c = _d.sent(), jsonId = _c[1];
                        return [4, updateGFileId(jsonId)];
                    case 5:
                        _d.sent();
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
                        return [4, axios_1["default"].post("".concat(this._client.defaults.baseURL, "/kc/auth/refresh"), {
                                refresh: (_b = this._apiToken) === null || _b === void 0 ? void 0 : _b.kc_refresh
                            })];
                    case 1:
                        data = (_c.sent()).data;
                        this._apiToken = data.data;
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
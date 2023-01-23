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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.decrypt = exports.encrypt = void 0;
var lodash_1 = __importDefault(require("lodash"));
var aes = __importStar(require("./aes"));
var rsa = __importStar(require("./rsa"));
var chacha = __importStar(require("./chacha"));
var node_forge_1 = require("node-forge");
function encrypt(plain, commSecret) {
    if (!lodash_1["default"].isEmpty(commSecret.aesPwd) && !lodash_1["default"].isEmpty(commSecret.aesSalt)) {
        plain = aes.encrypt(plain, commSecret.aesPwd, commSecret.aesSalt);
    }
    var _a = chacha.encrypt(node_forge_1.util.encodeUtf8(plain)), keyBytes = _a.keyBytes, b64DataBytes = _a.b64DataBytes;
    var secret = rsa.encrypt(commSecret.rsaKey, keyBytes);
    return { data: b64DataBytes, secret: secret };
}
exports.encrypt = encrypt;
function decrypt(data, commSecret) {
    var chachaKey = rsa.decrypt(commSecret.rsaKey, data.secret);
    var ret = chacha.decrypt(chachaKey, data.data);
    if (lodash_1["default"].isEmpty(commSecret.aesPwd) || lodash_1["default"].isEmpty(commSecret.aesSalt)) {
        return ret;
    }
    return aes.decrypt(ret, commSecret.aesPwd, commSecret.aesSalt);
}
exports.decrypt = decrypt;
//# sourceMappingURL=v2.js.map
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
exports.decrypt = exports.encrypt = exports.genPassword = void 0;
var crypto_1 = __importStar(require("crypto"));
var ALGO_NAME = 'chacha20-poly1305';
var AUTHTAG_LEN = 16;
var NONCE_LEN = 12;
function genPassword() {
    return (0, crypto_1.randomBytes)(32);
}
exports.genPassword = genPassword;
function encrypt(key, plain) {
    var nonce = (0, crypto_1.randomBytes)(NONCE_LEN);
    var cipher = crypto_1["default"].createCipheriv(ALGO_NAME, key, nonce, {
        authTagLength: AUTHTAG_LEN
    });
    return Buffer.concat([
        nonce,
        cipher.update(plain),
        cipher.final(),
        cipher.getAuthTag(),
    ]);
}
exports.encrypt = encrypt;
function decrypt(key, encrypted) {
    var nonce = encrypted.subarray(0, NONCE_LEN);
    var decipher = crypto_1["default"].createDecipheriv(ALGO_NAME, key, nonce, {
        authTagLength: AUTHTAG_LEN
    });
    decipher.setAuthTag(encrypted.subarray(-AUTHTAG_LEN));
    return Buffer.concat([
        decipher.update(encrypted.subarray(NONCE_LEN, -AUTHTAG_LEN)),
        decipher.final(),
    ]);
}
exports.decrypt = decrypt;
//# sourceMappingURL=chacha.js.map
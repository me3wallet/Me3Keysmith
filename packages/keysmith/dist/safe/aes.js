"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.decrypt = exports.encrypt = void 0;
var lodash_1 = __importDefault(require("lodash"));
var crypto_1 = require("crypto");
var ENC_ALGO = 256;
var KEY_SIZE = ENC_ALGO / 8;
var IV_SIZE = 128 / 8;
function encrypt(plain, password, salt) {
    var key = (0, crypto_1.pbkdf2Sync)(password, salt, 1, KEY_SIZE, 'sha512');
    var iv = (0, crypto_1.pbkdf2Sync)(password, salt, 1, IV_SIZE, 'sha512');
    var cipher = (0, crypto_1.createCipheriv)("aes-".concat(ENC_ALGO, "-cbc"), key, iv);
    cipher.setAutoPadding(false);
    var encrypted = Buffer.concat([
        cipher.update(_paddingSpace(plain), 'utf8'),
        cipher.final(),
    ]).toString('hex');
    return Buffer.from(encrypted, 'utf8')
        .toString('base64');
}
exports.encrypt = encrypt;
function decrypt(b64Str, password, salt) {
    var key = (0, crypto_1.pbkdf2Sync)(password, salt, 1, KEY_SIZE, 'sha512');
    var iv = (0, crypto_1.pbkdf2Sync)(password, salt, 1, IV_SIZE, 'sha512');
    var utf8 = Buffer.from(b64Str, 'base64').toString('utf8');
    var decipher = (0, crypto_1.createDecipheriv)("aes-".concat(ENC_ALGO, "-cbc"), key, iv);
    decipher.setAutoPadding(false);
    var decoded = Buffer.concat([
        decipher.update(utf8, 'hex'),
        decipher.final(),
    ]).toString('utf8');
    return lodash_1["default"].trimEnd(decoded, ' ');
}
exports.decrypt = decrypt;
function _paddingSpace(str, pad) {
    if (pad === void 0) { pad = 16; }
    var paddedLen = str.length + pad - (str.length % pad);
    return lodash_1["default"].padEnd(str, paddedLen);
}
//# sourceMappingURL=aes.js.map
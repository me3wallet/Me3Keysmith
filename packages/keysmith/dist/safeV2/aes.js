"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.decrypt = exports.encrypt = void 0;
var lodash_1 = __importDefault(require("lodash"));
var node_forge_1 = require("node-forge");
var KEY_SIZE = 256 / 8;
var IV_SIZE = 128 / 8;
function encrypt(plain, password, salt) {
    var key = (0, node_forge_1.pbkdf2)(password, salt, 1, KEY_SIZE, 'sha512');
    var iv = (0, node_forge_1.pbkdf2)(password, salt, 1, IV_SIZE, 'sha512');
    var engine = node_forge_1.cipher.createCipher('AES-CBC', key);
    engine.mode.pad = undefined;
    engine.mode.unpad = undefined;
    engine.start({ iv: iv });
    engine.update(node_forge_1.util.createBuffer(_paddingSpace(plain), 'utf8'));
    engine.finish();
    return node_forge_1.util.encode64(node_forge_1.util.encodeUtf8(engine.output.toHex()));
}
exports.encrypt = encrypt;
function decrypt(b64Str, password, salt) {
    var rawBytes = node_forge_1.util.hexToBytes(node_forge_1.util.decodeUtf8(node_forge_1.util.decode64(b64Str)));
    var key = (0, node_forge_1.pbkdf2)(password, salt, 1, KEY_SIZE, 'sha512');
    var iv = (0, node_forge_1.pbkdf2)(password, salt, 1, IV_SIZE, 'sha512');
    var engine = node_forge_1.cipher.createDecipher('AES-CBC', key);
    engine.mode.pad = undefined;
    engine.mode.unpad = undefined;
    engine.start({ iv: iv });
    engine.update(node_forge_1.util.createBuffer(rawBytes));
    engine.finish();
    return lodash_1["default"].trimEnd(node_forge_1.util.decodeUtf8(engine.output), ' ');
}
exports.decrypt = decrypt;
function _paddingSpace(str, pad) {
    if (pad === void 0) { pad = 16; }
    var paddedLen = str.length + pad - (str.length % pad);
    return lodash_1["default"].padEnd(str, paddedLen);
}
//# sourceMappingURL=aes.js.map
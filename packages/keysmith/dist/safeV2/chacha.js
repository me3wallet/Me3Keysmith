"use strict";
exports.__esModule = true;
exports.decrypt = exports.encrypt = void 0;
var chacha20poly1305_1 = require("@stablelib/chacha20poly1305");
var bytes_1 = require("@stablelib/bytes");
var node_forge_1 = require("node-forge");
var common_1 = require("./common");
function encrypt(utf8PlainBytes) {
    var keyBytes = node_forge_1.random.getBytesSync(chacha20poly1305_1.KEY_LENGTH);
    var dataArray = (0, common_1.forgeBytes2Uint8Array)(node_forge_1.util.encodeUtf8(utf8PlainBytes));
    var cipher = new chacha20poly1305_1.ChaCha20Poly1305((0, common_1.forgeBytes2Uint8Array)(keyBytes));
    var nonceArray = (0, common_1.forgeBytes2Uint8Array)(node_forge_1.random.getBytesSync(chacha20poly1305_1.NONCE_LENGTH));
    var encrypted = cipher.seal(nonceArray, dataArray);
    var forgeBytes = (0, common_1.uint8Array2ForgeBytes)((0, bytes_1.concat)(nonceArray, encrypted));
    var dataBytes = node_forge_1.util.encode64(forgeBytes);
    return { keyBytes: keyBytes, b64DataBytes: dataBytes };
}
exports.encrypt = encrypt;
function decrypt(keyBytes, encryptedBytes) {
    var decipher = new chacha20poly1305_1.ChaCha20Poly1305((0, common_1.forgeBytes2Uint8Array)(keyBytes));
    var encryptedArray = (0, common_1.forgeBytes2Uint8Array)(node_forge_1.util.decode64(encryptedBytes));
    var decrypted = decipher.open(encryptedArray.slice(0, chacha20poly1305_1.NONCE_LENGTH), encryptedArray.slice(chacha20poly1305_1.NONCE_LENGTH));
    return node_forge_1.util.decodeUtf8((0, common_1.uint8Array2ForgeBytes)(decrypted));
}
exports.decrypt = decrypt;
//# sourceMappingURL=chacha.js.map
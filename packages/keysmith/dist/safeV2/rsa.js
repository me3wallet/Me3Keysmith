"use strict";
exports.__esModule = true;
exports.decrypt = exports.encrypt = exports.genKeyPair = void 0;
var node_forge_1 = require("node-forge");
function _b64DerStr2Key(b64DerStr, isPriKey) {
    if (isPriKey === void 0) { isPriKey = true; }
    var asn1Obj = node_forge_1.asn1.fromDer(node_forge_1.util.decode64(b64DerStr));
    return isPriKey === true
        ? node_forge_1.pki.privateKeyFromAsn1(asn1Obj)
        : node_forge_1.pki.publicKeyFromAsn1(asn1Obj);
}
function _key2B64DerStr(key, isPriKey) {
    if (isPriKey === void 0) { isPriKey = true; }
    var asn1Obj = isPriKey === true ? node_forge_1.pki.privateKeyToAsn1(key) : node_forge_1.pki.publicKeyToAsn1(key);
    var derFmt = node_forge_1.asn1.toDer(asn1Obj).getBytes();
    return node_forge_1.util.encode64(derFmt);
}
function genKeyPair() {
    var _a = node_forge_1.pki.rsa.generateKeyPair({
        bits: 1024,
        e: 0x10001
    }), privateKey = _a.privateKey, publicKey = _a.publicKey;
    return {
        privateKey: _key2B64DerStr(privateKey, true),
        publicKey: _key2B64DerStr(publicKey, false)
    };
}
exports.genKeyPair = genKeyPair;
function encrypt(b64Key, utf8plainBytes) {
    var keyObj = _b64DerStr2Key(b64Key, false);
    return keyObj.encrypt(utf8plainBytes, 'RSA-OAEP', {
        md: node_forge_1.md.sha1.create(),
        mgf1: {
            md: node_forge_1.md.sha1.create()
        }
    });
}
exports.encrypt = encrypt;
function decrypt(b64Key, encryptedForgeBytes) {
    var priKey = _b64DerStr2Key(b64Key, true);
    return priKey.decrypt(encryptedForgeBytes, 'RSA-OAEP');
}
exports.decrypt = decrypt;
//# sourceMappingURL=rsa.js.map
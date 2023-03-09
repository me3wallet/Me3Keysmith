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
exports.uint8Array2ForgeBytes = exports.forgeBytes2Uint8Array = void 0;
var node_forge_1 = require("node-forge");
var stableHex = __importStar(require("@stablelib/hex"));
function forgeBytes2Uint8Array(forgeBytesStr) {
    var hexStr = node_forge_1.util.bytesToHex(forgeBytesStr);
    return stableHex.decode(hexStr);
}
exports.forgeBytes2Uint8Array = forgeBytes2Uint8Array;
function uint8Array2ForgeBytes(array) {
    var hex = stableHex.encode(array);
    return node_forge_1.util.hexToBytes(hex);
}
exports.uint8Array2ForgeBytes = uint8Array2ForgeBytes;
//# sourceMappingURL=common.js.map
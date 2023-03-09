import { util } from 'node-forge'
import * as stableHex from '@stablelib/hex'

export function forgeBytes2Uint8Array(forgeBytesStr: string): Uint8Array {
  const hexStr = util.bytesToHex(forgeBytesStr)
  return stableHex.decode(hexStr)
}

export function uint8Array2ForgeBytes(array: Uint8Array): string {
  const hex = stableHex.encode(array)
  return util.hexToBytes(hex)
}
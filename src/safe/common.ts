import _ from "lodash";

export function paddingSpace(str: string, pad = 16) {
  const paddedLen = str.length + pad - (str.length % pad);
  return _.padEnd(str, paddedLen);
}

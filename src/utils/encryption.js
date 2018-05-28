import forge from "node-forge";

// Expects byteString as input
// Returns [obfuscatedHash, nextHash] as byteString
export function hashChain(byteStr) {
  const obfuscatedHash = forge.md.sha384
    .create()
    .update(byteStr)
    .digest()
    .bytes();
  const nextHash = forge.md.sha256
    .create()
    .update(byteStr)
    .digest()
    .bytes();

  return [obfuscatedHash, nextHash];
}

export default {
  hashChain
};

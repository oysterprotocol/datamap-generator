import forge from "node-forge";

// Expects the handle
// Genesis hash is not yet obfuscated.
const genesisHash = handle => {
  const primordialHash = handle.substr(8, 64);
  const byteStr = forge.util.hexToBytes(primordialHash);
  const [_obfuscatedHash, genHash] = hashChain(byteStr);

  return forge.util.bytesToHex(genHash);
};

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
  hashChain,
  genesisHash
};

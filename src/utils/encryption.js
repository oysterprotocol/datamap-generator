import CryptoJS from "crypto-js";

// Genesis hash is not yet obfuscated.
const genesisHash = handle => {
    const [genHash] = hashChain(handle);

    return genHash;
};

// Returns [obfuscatedHash, nextHash]
const hashChain = hash => {
    const obfuscatedHash = CryptoJS.SHA384(hash).toString();
    const nextHash = CryptoJS.SHA256(hash).toString();

    return [obfuscatedHash, nextHash];
};

export default {
  hashChain,
  genesisHash
};

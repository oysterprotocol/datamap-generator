import iota from "./services/iota";
import Encryption from "./utils/encryption";

export const generate = (handle, size, opts = {}) => {
  let offsets = 1; // Meta chunk

  if (opts.includeTreasureOffsets) {
    const numTreasureChunks = 1;
    offsets += numTreasureChunks;
    console.log("offsets");
    console.log(offsets);
  }

  const keys = Array.from(Array(size + offsets), (_, i) => i);

  const [dataMap] = keys.reduce(
    ([dataM, hash], i) => {
      const [obfuscatedHash, nextHash] = Encryption.hashChain(hash);
      dataM[i] = iota.toAddress(iota.utils.toTrytes(obfuscatedHash));
      return [dataM, nextHash];
    },
    [{}, Encryption.genesisHash(handle)]
  );
  return dataMap;
};

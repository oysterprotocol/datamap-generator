import iota from "./services/iota";
import Encryption from "./utils/encryption";

import { FILE } from "./config";

export const generate = (handle, size, opts = {}) => {
  let offsets = 1; // Meta chunk

  if (opts.includeTreasureOffsets) {
    // Includes 1 treasure per sector.
    const numTreasureChunks = Math.ceil(size / (FILE.CHUNKS_PER_SECTOR - 1));
    offsets += numTreasureChunks;
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

import iota from "./services/iota";
import Encryption from "./utils/encryption";

import { FILE } from "./config";
import util from "node-forge/lib/util";

export const generate = (genesisHash, size, opts = {}) => {
  let offsets = 1 - !!opts.raw; // Meta chunk

  if (opts.includeTreasureOffsets) {
    // Includes 1 treasure per sector.
    const numTreasureChunks = Math.ceil(size / (FILE.CHUNKS_PER_SECTOR - 1));
    offsets += numTreasureChunks;
  }

  const keys = Array.from(Array(size + offsets), (_, i) => i + !!opts.raw);

  const [dataMap] = keys.reduce(
    ([dataM, hash], i) => {
      const [obfuscatedHash, nextHash] = Encryption.hashChain(hash);
      dataM[i] = opts.raw
        ? nextHash
        : iota.toAddress(iota.utils.toTrytes(obfuscatedHash));
      return [dataM, nextHash];
    },
    [{}, util.hexToBytes(genesisHash)]
  );

  if (opts.raw)
    dataMap[0] = genesisHash;

  return dataMap;
};

const rawGenerate = (genesisHash, size, opts = {}) => {
  opts.raw = true
  return generate(genesisHash, size, opts)
}

const {
  genesisHash,
  decryptChunk,
  encryptChunk,
  getPrimordialHash,
  getSalt,
  obfuscate,
  parseEightCharsOfFilename,
  sideChain,
  sideChainGenerate,
  decryptTreasure,
  hashChain
} = Encryption;

export default {
  generate,
  genesisHash,
  rawGenerate,
  decryptChunk,
  encryptChunk,
  getPrimordialHash,
  getSalt,
  obfuscate,
  parseEightCharsOfFilename,
  sideChain,
  sideChainGenerate,
  decryptTreasure,
  hashChain
};

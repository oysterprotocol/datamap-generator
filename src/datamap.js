import iota from "./services/iota";
import Encryption from "./utils/encryption";

import { FILE } from "./config";
import util from "node-forge/lib/util";

const generate = (genesisHash, size, opts = {}) => {
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
    [{}, util.hexToBytes(genesisHash)]
  );
  return dataMap;
};

const rawGenerate = (genesisHash, size) => {
  const keys = Array.from(Array(size), (_, i) => i + 1);

  const [dataMap, _hash] = keys.reduce(
    ([dataM, hash], i) => {
      const [_obfuscatedHash, nextHash] = Encryption.hashChain(hash);
      dataM[i] = nextHash;

      return [dataM, nextHash];
    },
    [{}, util.hexToBytes(genesisHash)]
  );

  dataMap[0] = genesisHash;

  return dataMap;
};

const {
  genesisHash,
  sideChainGenerate,
  decryptTreasure,
  hashChain
} = Encryption;

export default {
  decryptTreasure,
  generate,
  genesisHash,
  hashChain,
  rawGenerate,
  sideChainGenerate
};

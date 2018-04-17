import iota from "./services/iota";
import Encryption from "./utils/encryption";

const generate = (handle, size) => {
  const keys = Array.from(Array(size + 1), (_, i) => i);

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

export default {generate};

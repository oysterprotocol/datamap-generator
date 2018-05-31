import CryptoJS from "crypto-js";
import { sha3_256 } from "js-sha3";
import forge from "node-forge";
// can't import iota from services/iota because the iota.lib.js tries to run
// curl.init() during the unit tests
import iotaUtils from "iota.lib.js/lib/utils/asciiToTrytes";
import _ from "lodash";

// an eth private seed key is 64 characters, the treasure prefix is 20 characters,
// and our tags are 32 characters
const PAYLOAD_LENGTH = 64;
const NONCE_LENGTH = 24;
const TAG_LENGTH = 32;
const TREASURE_PREFIX = _.split("Treasure: ", "")
  .map(char => {
    return char.charCodeAt(char).toString(16);
  })
  .join("");

const parseEightCharsOfFilename = fileName => {
  fileName = fileName + getSalt(8);
  fileName = fileName.substr(0, 8);

  return fileName;
};

// `length` should be a multiple of 8
export function getSalt(length) {
  const bytes = forge.random.getBytesSync(length);
  const byteArr = forge.util.binary.raw.decode(bytes);
  const salt = forge.util.binary.base58.encode(byteArr);
  return salt.substr(0, length);
}

export function getPrimordialHash() {
  const bytes = forge.random.getBytesSync(16);
  return forge.md.sha256
    .create()
    .update(bytes)
    .digest()
    .toHex();
}

const obfuscate = hash =>
  forge.md.sha384
    .create()
    .update(hash.toString())
    .digest()
    .toHex();

const sideChain = address => sha3_256(address).toString();

const decryptTest = (text, secretKey) => {
  //TODO temporary for debugging
  try {
    return CryptoJS.AES.decrypt(text, secretKey).toString();
  } catch (e) {
    return "";
  }
};

const decryptTreasure = (
  sideChainHash,
  signatureMessageFragment,
  sha256Hash
) => {
  const hexMessage = forge.util.bytesToHex(
    iotaUtils.fromTrytes(
      signatureMessageFragment.substring(
        0,
        PAYLOAD_LENGTH + TAG_LENGTH + TREASURE_PREFIX.length
      )
    )
  );

  const decryptedValue = decrypt(sideChainHash, hexMessage, sha256Hash);

  return _.startsWith(decryptedValue, TREASURE_PREFIX)
    ? _.replace(decryptedValue, TREASURE_PREFIX, "")
    : false;
};

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

const encryptChunk = (key, secret) => {
  key.read = 0;
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher("AES-GCM", key);

  cipher.start({
    iv: iv,
    tagLength: 0
  });

  cipher.update(forge.util.createBuffer(CHUNK_PREFIX + secret));
  cipher.finish();

  return cipher.output.getBytes() + iv;
};

const decryptChunk = (key, secret) => {
  key.read = 0;
  const iv = secret.substr(-IV_LENGTH);
  const decipher = forge.cipher.createDecipher("AES-GCM", key);

  decipher.start({
    iv: iv,
    tagLength: 0,
    output: null
  });

  decipher.update(
    forge.util.createBuffer(secret.substring(0, secret.length - IV_LENGTH))
  );

  if (!decipher.finish()) {
    let msg =
      "decipher failed to finished in decryptChunk in utils/encryption.js";
    Raven.captureException(new Error(msg));
    return "";
  }

  const hexedOutput = forge.util.bytesToHex(decipher.output);

  if (_.startsWith(hexedOutput, CHUNK_PREFIX_IN_HEX)) {
    return forge.util.hexToBytes(
      hexedOutput.substr(CHUNK_PREFIX_IN_HEX.length, hexedOutput.length)
    );
  } else {
    return "";
  }
};

export default {
  hashChain,
  genesisHash,
  decryptChunk,
  decryptTest, //TODO
  encryptChunk,
  getPrimordialHash,
  getSalt,
  obfuscate,
  parseEightCharsOfFilename,
  sideChain,
  decryptTreasure
};

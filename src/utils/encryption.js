import { sha3_256 } from "js-sha3";
import util from "node-forge/lib/util";
import random from "node-forge/lib/random";
import sha512 from "node-forge/lib/sha512";
import sha256 from "node-forge/lib/sha256";
import cipher from "node-forge/lib/cipher";
// can't import iota from services/iota because the iota.lib.js tries to run
// curl.init() during the unit tests
import iotaUtils from "iota.lib.js/lib/utils/asciiToTrytes";
import startsWith from "lodash/startsWith";
import replace from "lodash/replace";

// an eth private seed key is 64 characters, the treasure prefix is 20 characters,
// and our tags are 32 characters
const PAYLOAD_LENGTH = 64;
const NONCE_LENGTH = 24;
const TAG_LENGTH = 32;
const TREASURE_PREFIX = "Treasure: ".split("")
  .map(char => {
    return char.charCodeAt(char).toString(16);
  })
  .join("");

const parseEightCharsOfFilename = fileName => {
  // discuss how to handle 'illegal' characters, strip for now
  fileName = fileName.replace(/[^\w-]/, "");
  fileName = fileName + getSalt(8);
  fileName = fileName.substr(0, 8);

  return fileName;
};

// `length` should be a multiple of 8
const getSalt = length => {
  const bytes = random.getBytesSync(length);
  const byteArr = util.binary.raw.decode(bytes);
  const salt = util.binary.base58.encode(byteArr);
  return salt.substr(0, length);
};

const getPrimordialHash = () => {
  const bytes = random.getBytesSync(16);
  return sha512.sha256
    .create()
    .update(bytes)
    .digest()
    .toHex();
};

const obfuscate = hash => {
  const byteStr = util.hexToBytes(hash);
  const [obfuscatedHash, _genHash] = hashChain(byteStr);

  return util.bytesToHex(obfuscatedHash);
};

const sideChainGenerate = hash => {
  const range = Array.from(Array(1000), (_, i) => i);

  const sidechain = range.reduce((chain, n) => {
      const lastValue = chain[n];
      const nextValue = sideChain(lastValue);
      return [...chain, nextValue];
    },
    [sideChain(hash)]);

  return sidechain;
};

const sideChain = hash => sha3_256(util.binary.hex.decode(hash));

const encrypt = (key, secret, nonce) => {
  // this method is only for the unit tests
  let nonceInBytes = util.hexToBytes(nonce.substring(0, NONCE_LENGTH));
  const ciph = cipher.createCipher(
    "AES-GCM",
    util.hexToBytes(key)
  );

  ciph.start({
    iv: nonceInBytes,
    output: null
  });

  ciph.update(util.createBuffer(util.hexToBytes(secret)));

  ciph.finish();

  const encrypted = ciph.output;

  const tag = ciph.mode.tag;

  return encrypted.toHex() + tag.toHex();
};

const decryptTreasure = (
  sideChainHash,
  signatureMessageFragment,
  sha256Hash
) => {
  const hexMessage = util.bytesToHex(
    iotaUtils.fromTrytes(
      signatureMessageFragment.substring(
        0,
        PAYLOAD_LENGTH + TAG_LENGTH + TREASURE_PREFIX.length
      )
    )
  );

  const decryptedValue = decrypt(sideChainHash, hexMessage, sha256Hash);

  return startsWith(decryptedValue, TREASURE_PREFIX)
    ? replace(decryptedValue, TREASURE_PREFIX, "")
    : false;
};

const decrypt = (key, secret, nonce) => {
  let nonceInBytes = util.hexToBytes(nonce.substring(0, NONCE_LENGTH));

  const decipher = cipher.createDecipher(
    "AES-GCM",
    util.hexToBytes(key)
  );

  decipher.start({
    iv: nonceInBytes,
    output: null,
    tag: util.hexToBytes(
      secret.substring(secret.length - TAG_LENGTH, secret.length)
    )
  });

  decipher.update(
    util.createBuffer(
      util.hexToBytes(secret.substring(0, secret.length - TAG_LENGTH))
    )
  );
  if (!decipher.finish()) {
    return false;
  }

  return decipher.output.toHex();
};

// Genesis hash is not yet obfuscated.
const genesisHash = handle => {
  const primordialHash = handle.substr(8, 64);
  const byteStr = util.hexToBytes(primordialHash);
  const [_obfuscatedHash, genHash] = hashChain(byteStr);

  return util.bytesToHex(genHash);
};

// Expects byteString as input
// Returns [obfuscatedHash, nextHash] as byteString
const hashChain = byteStr => {
  const obfuscatedHash = sha512.sha384
    .create()
    .update(byteStr)
    .digest()
    .bytes();
  const nextHash = sha256
    .create()
    .update(byteStr)
    .digest()
    .bytes();

  return [obfuscatedHash, nextHash];
};

const encryptChunk = (key, idx, secret) => {
  key.read = 0;
  const iv = getNonce(key, idx);
  const cipher = cipher.createCipher("AES-GCM", key);

  cipher.start({
    iv: iv,
    tagLength: TAG_LENGTH * 8,
    additionalData: "binary-encoded string"
  });

  cipher.update(util.createBuffer(secret));
  cipher.finish();

  return cipher.output.bytes() + cipher.mode.tag.bytes() + iv;
};

const decryptChunk = (key, secret) => {
  key.read = 0;

  // Require a payload of at least one byte to attempt decryption
  if (secret.length <= IV_LENGTH + TAG_LENGTH) {
    return "";
  }

  const iv = secret.substr(-IV_LENGTH);
  const tag = secret.substr(-TAG_LENGTH - IV_LENGTH, TAG_LENGTH);
  const decipher = cipher.createDecipher("AES-GCM", key);

  decipher.start({
    iv: iv,
    tag: tag,
    tagLength: TAG_LENGTH * 8,
    additionalData: "binary-encoded string"
  });

  decipher.update(
    util.createBuffer(
      secret.substring(0, secret.length - TAG_LENGTH - IV_LENGTH)
    )
  );

  // Most likely a treasure chunk, skip
  if (!decipher.finish()) {
    return "";
  }

  return decipher.output.bytes();
};

export default {
  hashChain,
  genesisHash,
  decryptChunk,
  encryptChunk,
  getPrimordialHash,
  obfuscate,
  getSalt,
  parseEightCharsOfFilename,
  sideChain,
  sideChainGenerate,
  decryptTreasure,
  decrypt,
  encrypt
};

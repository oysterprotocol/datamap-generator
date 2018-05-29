import CryptoJS from "crypto-js";
import uuidv4 from "uuid/v4";
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
  fileName = fileName + "________";
  fileName = fileName.substr(0, 8);

  return fileName;
};

const getSalt = numChars => {
  let array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  let salt = array[0];

  return salt.toString(36).substr(2, numChars);
};

const getPrimordialHash = () => {
  const entropy = uuidv4();
  return CryptoJS.SHA256(entropy).toString();
};

const obfuscate = hash => CryptoJS.SHA384(hash).toString();

const sideChain = address => sha3_256(address).toString();

const decryptTest = (text, secretKey) => {
  //TODO temporary for debugging
  try {
    return CryptoJS.AES.decrypt(text, secretKey).toString();
  } catch (e) {
    return "";
  }
};

const encrypt = (key, secret, nonce) => {
  let nonceInBytes = forge.util.hexToBytes(nonce.substring(0, NONCE_LENGTH));
  const cipher = forge.cipher.createCipher(
    "AES-GCM",
    forge.util.hexToBytes(key)
  );

  cipher.start({
    iv: nonceInBytes,
    output: null
  });

  cipher.update(forge.util.createBuffer(forge.util.hexToBytes(secret)));

  cipher.finish();

  const encrypted = cipher.output;

  const tag = cipher.mode.tag;

  return encrypted.toHex() + tag.toHex();
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

const decrypt = (key, secret, nonce) => {
  let nonceInBytes = forge.util.hexToBytes(nonce.substring(0, NONCE_LENGTH));
  const decipher = forge.cipher.createDecipher(
    "AES-GCM",
    forge.util.hexToBytes(key)
  );

  decipher.start({
    iv: nonceInBytes,
    output: null,
    tag: forge.util.hexToBytes(
      secret.substring(secret.length - TAG_LENGTH, secret.length)
    )
  });

  decipher.update(
    forge.util.createBuffer(
      forge.util.hexToBytes(secret.substring(0, secret.length - TAG_LENGTH))
    )
  );
  if (!decipher.finish()) {
    return false;
  }

  return decipher.output.toHex();
};
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
  genesisHash,
  decrypt,
  decryptTest, //TODO
  encrypt,
  getPrimordialHash,
  getSalt,
  obfuscate,
  parseEightCharsOfFilename,
  sideChain,
  decryptTreasure
};

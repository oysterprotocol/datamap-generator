"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
// can't import iota from services/iota because the iota.lib.js tries to run
// curl.init() during the unit tests


var _jsSha = require("js-sha3");

var _util = require("node-forge/lib/util");

var _util2 = _interopRequireDefault(_util);

var _random = require("node-forge/lib/random");

var _random2 = _interopRequireDefault(_random);

var _sha = require("node-forge/lib/sha512");

var _sha2 = _interopRequireDefault(_sha);

var _sha3 = require("node-forge/lib/sha256");

var _sha4 = _interopRequireDefault(_sha3);

var _cipher = require("node-forge/lib/cipher");

var _cipher2 = _interopRequireDefault(_cipher);

var _asciiToTrytes = require("iota.lib.js/lib/utils/asciiToTrytes");

var _asciiToTrytes2 = _interopRequireDefault(_asciiToTrytes);

var _startsWith = require("lodash/startsWith");

var _startsWith2 = _interopRequireDefault(_startsWith);

var _replace = require("lodash/replace");

var _replace2 = _interopRequireDefault(_replace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// an eth private seed key is 64 characters, the treasure prefix is 20 characters,
// and our tags are 32 characters
var PAYLOAD_LENGTH = 64;
var NONCE_LENGTH = 24;
var TAG_LENGTH = 32;
var TREASURE_PREFIX = "Treasure: ".split("").map(function (char) {
  return char.charCodeAt(char).toString(16);
}).join("");

var parseEightCharsOfFilename = function parseEightCharsOfFilename(fileName) {
  // discuss how to handle 'illegal' characters, strip for now
  fileName = fileName.replace(/[^\w-]/, "");
  fileName = fileName + getSalt(8);
  fileName = fileName.substr(0, 8);

  return fileName;
};

// `length` should be a multiple of 8
var getSalt = function getSalt(length) {
  var bytes = _random2.default.getBytesSync(length);
  var byteArr = _util2.default.binary.raw.decode(bytes);
  var salt = _util2.default.binary.base58.encode(byteArr);
  return salt.substr(0, length);
};

var getPrimordialHash = function getPrimordialHash() {
  var bytes = _random2.default.getBytesSync(16);
  return _sha4.default.create().update(bytes).digest().toHex();
};

var obfuscate = function obfuscate(hash) {
  var byteStr = _util2.default.hexToBytes(hash);

  var _hashChain = hashChain(byteStr),
      _hashChain2 = _slicedToArray(_hashChain, 2),
      obfuscatedHash = _hashChain2[0],
      _genHash = _hashChain2[1];

  return _util2.default.bytesToHex(obfuscatedHash);
};

var sideChainGenerate = function sideChainGenerate(hash) {
  var range = Array.from(Array(1000), function (_, i) {
    return i;
  });

  var sidechain = range.reduce(function (chain, n) {
    var lastValue = chain[n];
    var nextValue = sideChain(lastValue);
    return [].concat(_toConsumableArray(chain), [nextValue]);
  }, [sideChain(hash)]);

  return sidechain;
};

var sideChain = function sideChain(hash) {
  return (0, _jsSha.sha3_256)(_util2.default.binary.hex.decode(hash));
};

var encrypt = function encrypt(key, secret, nonce) {
  // this method is only for the unit tests
  var nonceInBytes = _util2.default.hexToBytes(nonce.substring(0, NONCE_LENGTH));
  var ciph = _cipher2.default.createCipher("AES-GCM", _util2.default.hexToBytes(key));

  ciph.start({
    iv: nonceInBytes,
    output: null
  });

  ciph.update(_util2.default.createBuffer(_util2.default.hexToBytes(secret)));

  ciph.finish();

  var encrypted = ciph.output;

  var tag = ciph.mode.tag;

  return encrypted.toHex() + tag.toHex();
};

var decryptTreasure = function decryptTreasure(sideChainHash, signatureMessageFragment, sha256Hash) {
  var hexMessage = _util2.default.bytesToHex(_asciiToTrytes2.default.fromTrytes(signatureMessageFragment.substring(0, PAYLOAD_LENGTH + TAG_LENGTH + TREASURE_PREFIX.length)));

  var decryptedValue = decrypt(sideChainHash, hexMessage, sha256Hash);

  return (0, _startsWith2.default)(decryptedValue, TREASURE_PREFIX) ? (0, _replace2.default)(decryptedValue, TREASURE_PREFIX, "") : false;
};

var decrypt = function decrypt(key, secret, nonce) {
  var nonceInBytes = _util2.default.hexToBytes(nonce.substring(0, NONCE_LENGTH));

  var decipher = _cipher2.default.createDecipher("AES-GCM", _util2.default.hexToBytes(key));

  decipher.start({
    iv: nonceInBytes,
    output: null,
    tag: _util2.default.hexToBytes(secret.substring(secret.length - TAG_LENGTH, secret.length))
  });

  decipher.update(_util2.default.createBuffer(_util2.default.hexToBytes(secret.substring(0, secret.length - TAG_LENGTH))));
  if (!decipher.finish()) {
    return false;
  }

  return decipher.output.toHex();
};

// Genesis hash is not yet obfuscated.
var genesisHash = function genesisHash(handle) {
  var primordialHash = handle.substr(8, 64);
  var byteStr = _util2.default.hexToBytes(primordialHash);

  var _hashChain3 = hashChain(byteStr),
      _hashChain4 = _slicedToArray(_hashChain3, 2),
      _obfuscatedHash = _hashChain4[0],
      genHash = _hashChain4[1];

  return _util2.default.bytesToHex(genHash);
};

// Expects byteString as input
// Returns [obfuscatedHash, nextHash] as byteString
var hashChain = function hashChain(byteStr) {
  var obfuscatedHash = _sha2.default.sha384.create().update(byteStr).digest().bytes();
  var nextHash = _sha4.default.create().update(byteStr).digest().bytes();

  return [obfuscatedHash, nextHash];
};

var encryptChunk = function encryptChunk(key, idx, secret) {
  key.read = 0;
  var iv = getNonce(key, idx);
  var cipher = cipher.createCipher("AES-GCM", key);

  cipher.start({
    iv: iv,
    tagLength: TAG_LENGTH * 8,
    additionalData: "binary-encoded string"
  });

  cipher.update(_util2.default.createBuffer(secret));
  cipher.finish();

  return cipher.output.bytes() + cipher.mode.tag.bytes() + iv;
};

var decryptChunk = function decryptChunk(key, secret) {
  key.read = 0;

  // Require a payload of at least one byte to attempt decryption
  if (secret.length <= IV_LENGTH + TAG_LENGTH) {
    return "";
  }

  var iv = secret.substr(-IV_LENGTH);
  var tag = secret.substr(-TAG_LENGTH - IV_LENGTH, TAG_LENGTH);
  var decipher = _cipher2.default.createDecipher("AES-GCM", key);

  decipher.start({
    iv: iv,
    tag: tag,
    tagLength: TAG_LENGTH * 8,
    additionalData: "binary-encoded string"
  });

  decipher.update(_util2.default.createBuffer(secret.substring(0, secret.length - TAG_LENGTH - IV_LENGTH)));

  // Most likely a treasure chunk, skip
  if (!decipher.finish()) {
    return "";
  }

  return decipher.output.bytes();
};

exports.default = {
  hashChain: hashChain,
  genesisHash: genesisHash,
  decryptChunk: decryptChunk,
  encryptChunk: encryptChunk,
  getPrimordialHash: getPrimordialHash,
  obfuscate: obfuscate,
  getSalt: getSalt,
  parseEightCharsOfFilename: parseEightCharsOfFilename,
  sideChain: sideChain,
  sideChainGenerate: sideChainGenerate,
  decryptTreasure: decryptTreasure,
  decrypt: decrypt,
  encrypt: encrypt
};
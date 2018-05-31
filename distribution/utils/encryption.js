"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
// can't import iota from services/iota because the iota.lib.js tries to run
// curl.init() during the unit tests


exports.getSalt = getSalt;
exports.getPrimordialHash = getPrimordialHash;
exports.hashChain = hashChain;

var _cryptoJs = require("crypto-js");

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

var _jsSha = require("js-sha3");

var _nodeForge = require("node-forge");

var _nodeForge2 = _interopRequireDefault(_nodeForge);

var _asciiToTrytes = require("iota.lib.js/lib/utils/asciiToTrytes");

var _asciiToTrytes2 = _interopRequireDefault(_asciiToTrytes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// an eth private seed key is 64 characters, the treasure prefix is 20 characters,
// and our tags are 32 characters
var PAYLOAD_LENGTH = 64;
var NONCE_LENGTH = 24;
var TAG_LENGTH = 32;
var TREASURE_PREFIX = _lodash2.default.split("Treasure: ", "").map(function (char) {
  return char.charCodeAt(char).toString(16);
}).join("");

var parseEightCharsOfFilename = function parseEightCharsOfFilename(fileName) {
  fileName = fileName + getSalt(8);
  fileName = fileName.substr(0, 8);

  return fileName;
};

// `length` should be a multiple of 8
function getSalt(length) {
  var bytes = _nodeForge2.default.random.getBytesSync(length);
  var byteArr = _nodeForge2.default.util.binary.raw.decode(bytes);
  var salt = _nodeForge2.default.util.binary.base58.encode(byteArr);
  return salt.substr(0, length);
}

function getPrimordialHash() {
  var bytes = _nodeForge2.default.random.getBytesSync(16);
  return _nodeForge2.default.md.sha256.create().update(bytes).digest().toHex();
}

var obfuscate = function obfuscate(hash) {
  return _nodeForge2.default.md.sha384.create().update(hash.toString()).digest().toHex();
};

var sideChain = function sideChain(address) {
  return (0, _jsSha.sha3_256)(address).toString();
};

var decryptTest = function decryptTest(text, secretKey) {
  //TODO temporary for debugging
  try {
    return _cryptoJs2.default.AES.decrypt(text, secretKey).toString();
  } catch (e) {
    return "";
  }
};

var decryptTreasure = function decryptTreasure(sideChainHash, signatureMessageFragment, sha256Hash) {
  var hexMessage = _nodeForge2.default.util.bytesToHex(_asciiToTrytes2.default.fromTrytes(signatureMessageFragment.substring(0, PAYLOAD_LENGTH + TAG_LENGTH + TREASURE_PREFIX.length)));

  var decryptedValue = decrypt(sideChainHash, hexMessage, sha256Hash);

  return _lodash2.default.startsWith(decryptedValue, TREASURE_PREFIX) ? _lodash2.default.replace(decryptedValue, TREASURE_PREFIX, "") : false;
};

// Genesis hash is not yet obfuscated.
var genesisHash = function genesisHash(handle) {
  var primordialHash = handle.substr(8, 64);
  var byteStr = _nodeForge2.default.util.hexToBytes(primordialHash);

  var _hashChain = hashChain(byteStr),
      _hashChain2 = _slicedToArray(_hashChain, 2),
      _obfuscatedHash = _hashChain2[0],
      genHash = _hashChain2[1];

  return _nodeForge2.default.util.bytesToHex(genHash);
};

// Expects byteString as input
// Returns [obfuscatedHash, nextHash] as byteString
function hashChain(byteStr) {
  var obfuscatedHash = _nodeForge2.default.md.sha384.create().update(byteStr).digest().bytes();
  var nextHash = _nodeForge2.default.md.sha256.create().update(byteStr).digest().bytes();

  return [obfuscatedHash, nextHash];
}

var encryptChunk = function encryptChunk(key, secret) {
  key.read = 0;
  var iv = _nodeForge2.default.random.getBytesSync(16);
  var cipher = _nodeForge2.default.cipher.createCipher("AES-GCM", key);

  cipher.start({
    iv: iv,
    tagLength: 0
  });

  cipher.update(_nodeForge2.default.util.createBuffer(CHUNK_PREFIX + secret));
  cipher.finish();

  return cipher.output.getBytes() + iv;
};

var decryptChunk = function decryptChunk(key, secret) {
  key.read = 0;
  var iv = secret.substr(-IV_LENGTH);
  var decipher = _nodeForge2.default.cipher.createDecipher("AES-GCM", key);

  decipher.start({
    iv: iv,
    tagLength: 0,
    output: null
  });

  decipher.update(_nodeForge2.default.util.createBuffer(secret.substring(0, secret.length - IV_LENGTH)));

  if (!decipher.finish()) {
    var msg = "decipher failed to finished in decryptChunk in utils/encryption.js";
    Raven.captureException(new Error(msg));
    return "";
  }

  var hexedOutput = _nodeForge2.default.util.bytesToHex(decipher.output);

  if (_lodash2.default.startsWith(hexedOutput, CHUNK_PREFIX_IN_HEX)) {
    return _nodeForge2.default.util.hexToBytes(hexedOutput.substr(CHUNK_PREFIX_IN_HEX.length, hexedOutput.length));
  } else {
    return "";
  }
};

exports.default = {
  hashChain: hashChain,
  genesisHash: genesisHash,
  decryptChunk: decryptChunk,
  decryptTest: decryptTest, //TODO
  encryptChunk: encryptChunk,
  getPrimordialHash: getPrimordialHash,
  getSalt: getSalt,
  obfuscate: obfuscate,
  parseEightCharsOfFilename: parseEightCharsOfFilename,
  sideChain: sideChain,
  decryptTreasure: decryptTreasure
};
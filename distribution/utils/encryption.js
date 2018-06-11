"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    }
  };
})();

// can't import iota from services/iota because the iota.lib.js tries to run
// curl.init() during the unit tests

var _jsSha = require("js-sha3");

var _nodeForge = require("node-forge");

var _nodeForge2 = _interopRequireDefault(_nodeForge);

var _asciiToTrytes = require("iota.lib.js/lib/utils/asciiToTrytes");

var _asciiToTrytes2 = _interopRequireDefault(_asciiToTrytes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

// an eth private seed key is 64 characters, the treasure prefix is 20 characters,
// and our tags are 32 characters
var PAYLOAD_LENGTH = 64;
var NONCE_LENGTH = 24;
var TAG_LENGTH = 32;
var TREASURE_PREFIX = _lodash2.default
  .split("Treasure: ", "")
  .map(function(char) {
    return char.charCodeAt(char).toString(16);
  })
  .join("");

var parseEightCharsOfFilename = function parseEightCharsOfFilename(fileName) {
  // discuss how to handle 'illegal' characters, strip for now
  fileName = fileName.replace(/[^\w-]/, "");
  fileName = fileName + getSalt(8);
  fileName = fileName.substr(0, 8);

  return fileName;
};

// `length` should be a multiple of 8
var getSalt = function getSalt(length) {
  var bytes = _nodeForge2.default.random.getBytesSync(length);
  var byteArr = _nodeForge2.default.util.binary.raw.decode(bytes);
  var salt = _nodeForge2.default.util.binary.base58.encode(byteArr);
  return salt.substr(0, length);
};

var getPrimordialHash = function getPrimordialHash() {
  var bytes = _nodeForge2.default.random.getBytesSync(16);
  return _nodeForge2.default.md.sha256
    .create()
    .update(bytes)
    .digest()
    .toHex();
};

var obfuscate = function obfuscate(hash) {
  var byteStr = _nodeForge2.default.util.hexToBytes(hash);

  var _hashChain = hashChain(byteStr),
    _hashChain2 = _slicedToArray(_hashChain, 2),
    obfuscatedHash = _hashChain2[0],
    _genHash = _hashChain2[1];

  return _nodeForge2.default.util.bytesToHex(obfuscatedHash);
};

var sideChainGenerate = function sideChainGenerate(hash) {
  var range = _lodash2.default.range(0, 1000);

  var sidechain = _lodash2.default.reduce(
    range,
    function(chain, n) {
      var lastValue = chain[n];
      var nextValue = sideChain(lastValue);
      return [].concat(_toConsumableArray(chain), [nextValue]);
    },
    [sideChain(hash)]
  );

  return sidechain;
};

var sideChain = function sideChain(hash) {
  return (0, _jsSha.sha3_256)(hash).toString();
};

var encrypt = function encrypt(key, secret, nonce) {
  // this method is only for the unit tests
  var nonceInBytes = _nodeForge2.default.util.hexToBytes(
    nonce.substring(0, NONCE_LENGTH)
  );
  var cipher = _nodeForge2.default.cipher.createCipher(
    "AES-GCM",
    _nodeForge2.default.util.hexToBytes(key)
  );

  cipher.start({
    iv: nonceInBytes,
    output: null
  });

  cipher.update(
    _nodeForge2.default.util.createBuffer(
      _nodeForge2.default.util.hexToBytes(secret)
    )
  );

  cipher.finish();

  var encrypted = cipher.output;

  var tag = cipher.mode.tag;

  return encrypted.toHex() + tag.toHex();
};

var decryptTreasure = function decryptTreasure(
  sideChainHash,
  signatureMessageFragment,
  sha256Hash
) {
  var hexMessage = _nodeForge2.default.util.bytesToHex(
    _asciiToTrytes2.default.fromTrytes(
      signatureMessageFragment.substring(
        0,
        PAYLOAD_LENGTH + TAG_LENGTH + TREASURE_PREFIX.length
      )
    )
  );

  var decryptedValue = decrypt(sideChainHash, hexMessage, sha256Hash);

  return _lodash2.default.startsWith(decryptedValue, TREASURE_PREFIX)
    ? _lodash2.default.replace(decryptedValue, TREASURE_PREFIX, "")
    : false;
};

var decrypt = function decrypt(key, secret, nonce) {
  var nonceInBytes = _nodeForge2.default.util.hexToBytes(
    nonce.substring(0, NONCE_LENGTH)
  );

  var decipher = _nodeForge2.default.cipher.createDecipher(
    "AES-GCM",
    _nodeForge2.default.util.hexToBytes(key)
  );

  decipher.start({
    iv: nonceInBytes,
    output: null,
    tag: _nodeForge2.default.util.hexToBytes(
      secret.substring(secret.length - TAG_LENGTH, secret.length)
    )
  });

  decipher.update(
    _nodeForge2.default.util.createBuffer(
      _nodeForge2.default.util.hexToBytes(
        secret.substring(0, secret.length - TAG_LENGTH)
      )
    )
  );
  if (!decipher.finish()) {
    return false;
  }

  return decipher.output.toHex();
};

// Genesis hash is not yet obfuscated.
var genesisHash = function genesisHash(handle) {
  var primordialHash = handle.substr(8, 64);
  var byteStr = _nodeForge2.default.util.hexToBytes(primordialHash);

  var _hashChain3 = hashChain(byteStr),
    _hashChain4 = _slicedToArray(_hashChain3, 2),
    _obfuscatedHash = _hashChain4[0],
    genHash = _hashChain4[1];

  return _nodeForge2.default.util.bytesToHex(genHash);
};

// Expects byteString as input
// Returns [obfuscatedHash, nextHash] as byteString
var hashChain = function hashChain(byteStr) {
  var obfuscatedHash = _nodeForge2.default.md.sha384
    .create()
    .update(byteStr)
    .digest()
    .bytes();
  var nextHash = _nodeForge2.default.md.sha256
    .create()
    .update(byteStr)
    .digest()
    .bytes();

  return [obfuscatedHash, nextHash];
};

var encryptChunk = function encryptChunk(key, idx, secret) {
  key.read = 0;
  var iv = getNonce(key, idx);
  var cipher = _nodeForge2.default.cipher.createCipher("AES-GCM", key);

  cipher.start({
    iv: iv,
    tagLength: TAG_LENGTH * 8,
    additionalData: "binary-encoded string"
  });

  cipher.update(_nodeForge2.default.util.createBuffer(secret));
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
  var decipher = _nodeForge2.default.cipher.createDecipher("AES-GCM", key);

  decipher.start({
    iv: iv,
    tag: tag,
    tagLength: TAG_LENGTH * 8,
    additionalData: "binary-encoded string"
  });

  decipher.update(
    _nodeForge2.default.util.createBuffer(
      secret.substring(0, secret.length - TAG_LENGTH - IV_LENGTH)
    )
  );

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

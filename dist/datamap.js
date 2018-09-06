"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _iota = require("./services/iota");

var _iota2 = _interopRequireDefault(_iota);

var _encryption = require("./utils/encryption");

var _encryption2 = _interopRequireDefault(_encryption);

var _config = require("./config");

var _util = require("node-forge/lib/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var generate = exports.generate = function generate(genesisHash, size) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var offsets = 1 - !!opts.raw; // Meta chunk

  if (opts.includeTreasureOffsets) {
    // Includes 1 treasure per sector.
    var numTreasureChunks = Math.ceil(size / (_config.FILE.CHUNKS_PER_SECTOR - 1));
    offsets += numTreasureChunks;
  }

  var keys = Array.from(Array(size + offsets), function (_, i) {
    return i + !!opts.raw;
  });

  var _keys$reduce = keys.reduce(function (_ref, i) {
    var _ref2 = _slicedToArray(_ref, 2),
        dataM = _ref2[0],
        hash = _ref2[1];

    var _Encryption$hashChain = _encryption2.default.hashChain(hash),
        _Encryption$hashChain2 = _slicedToArray(_Encryption$hashChain, 2),
        obfuscatedHash = _Encryption$hashChain2[0],
        nextHash = _Encryption$hashChain2[1];

    dataM[i] = opts.raw ? nextHash : _iota2.default.toAddress(_iota2.default.utils.toTrytes(obfuscatedHash));
    return [dataM, nextHash];
  }, [{}, _util2.default.hexToBytes(genesisHash)]),
      _keys$reduce2 = _slicedToArray(_keys$reduce, 1),
      dataMap = _keys$reduce2[0];

  if (opts.raw) dataMap[0] = genesisHash;

  return dataMap;
};

var rawGenerate = function rawGenerate(genesisHash, size) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  opts.raw = true;
  return generate(genesisHash, size, opts);
};

var genesisHash = _encryption2.default.genesisHash,
    decryptChunk = _encryption2.default.decryptChunk,
    encryptChunk = _encryption2.default.encryptChunk,
    getPrimordialHash = _encryption2.default.getPrimordialHash,
    getSalt = _encryption2.default.getSalt,
    obfuscate = _encryption2.default.obfuscate,
    parseEightCharsOfFilename = _encryption2.default.parseEightCharsOfFilename,
    sideChain = _encryption2.default.sideChain,
    sideChainGenerate = _encryption2.default.sideChainGenerate,
    decryptTreasure = _encryption2.default.decryptTreasure,
    hashChain = _encryption2.default.hashChain;
exports.default = {
  generate: generate,
  genesisHash: genesisHash,
  rawGenerate: rawGenerate,
  decryptChunk: decryptChunk,
  encryptChunk: encryptChunk,
  getPrimordialHash: getPrimordialHash,
  getSalt: getSalt,
  obfuscate: obfuscate,
  parseEightCharsOfFilename: parseEightCharsOfFilename,
  sideChain: sideChain,
  sideChainGenerate: sideChainGenerate,
  decryptTreasure: decryptTreasure,
  hashChain: hashChain
};
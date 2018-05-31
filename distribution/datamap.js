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

var _nodeForge = require("node-forge");

var _nodeForge2 = _interopRequireDefault(_nodeForge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var generate = exports.generate = function generate(genesisHash, size) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var offsets = 1; // Meta chunk

  if (opts.includeTreasureOffsets) {
    // Includes 1 treasure per sector.
    var numTreasureChunks = Math.ceil(size / (_config.FILE.CHUNKS_PER_SECTOR - 1));
    offsets += numTreasureChunks;
  }

  var keys = Array.from(Array(size + offsets), function (_, i) {
    return i;
  });

  var _keys$reduce = keys.reduce(function (_ref, i) {
    var _ref2 = _slicedToArray(_ref, 2),
        dataM = _ref2[0],
        hash = _ref2[1];

    var _Encryption$hashChain = _encryption2.default.hashChain(hash),
        _Encryption$hashChain2 = _slicedToArray(_Encryption$hashChain, 2),
        obfuscatedHash = _Encryption$hashChain2[0],
        nextHash = _Encryption$hashChain2[1];

    dataM[i] = _iota2.default.toAddress(_iota2.default.utils.toTrytes(obfuscatedHash));
    return [dataM, nextHash];
  }, [{}, _nodeForge2.default.util.hexToBytes(genesisHash)]),
      _keys$reduce2 = _slicedToArray(_keys$reduce, 1),
      dataMap = _keys$reduce2[0];

  return dataMap;
};

var rawGenerate = function rawGenerate(genesisHash, size) {
  var keys = _.range(1, size);

  var _$reduce = _.reduce(keys, function (_ref3, i) {
    var _ref4 = _slicedToArray(_ref3, 2),
        dataM = _ref4[0],
        hash = _ref4[1];

    var _Encryption$hashChain3 = _encryption2.default.hashChain(hash),
        _Encryption$hashChain4 = _slicedToArray(_Encryption$hashChain3, 2),
        _obfuscatedHash = _Encryption$hashChain4[0],
        nextHash = _Encryption$hashChain4[1];

    dataM[i] = nextHash;

    return [dataM, nextHash];
  }, [{}, _nodeForge2.default.util.hexToBytes(genesisHash)]),
      _$reduce2 = _slicedToArray(_$reduce, 2),
      dataMap = _$reduce2[0],
      _hash = _$reduce2[1];

  dataMap[0] = genesisHash;

  return dataMap;
};

var genesisHash = _encryption2.default.genesisHash,
    decryptChunk = _encryption2.default.decryptChunk,
    decryptTest = _encryption2.default.decryptTest,
    encryptChunk = _encryption2.default.encryptChunk,
    getPrimordialHash = _encryption2.default.getPrimordialHash,
    getSalt = _encryption2.default.getSalt,
    obfuscate = _encryption2.default.obfuscate,
    parseEightCharsOfFilename = _encryption2.default.parseEightCharsOfFilename,
    sideChain = _encryption2.default.sideChain,
    decryptTreasure = _encryption2.default.decryptTreasure;
exports.default = {
  generate: generate,
  genesisHash: genesisHash,
  rawGenerate: rawGenerate,
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
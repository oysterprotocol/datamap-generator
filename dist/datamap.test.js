"use strict";

var _datamap = require("./datamap");

var _datamap2 = _interopRequireDefault(_datamap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

test("Generates correct number of chunks", function () {
  var chunksCount = 3; // Adds an extra meta chunk
  var datamap = _datamap2.default.generate("handle123", chunksCount);

  expect(Object.keys(datamap).length).toBe(chunksCount + 1);
});

test("Generates correct number of chunks with treasure", function () {
  var opts = { includeTreasureOffsets: true };
  var chunksCount = 3; // Adds an extra meta chunk and another for treasure.
  var datamap = _datamap2.default.generate("handle123", chunksCount, opts);

  expect(Object.keys(datamap).length).toBe(chunksCount + 2);
});

test("Compares new generate raw to old", function () {
  var chunksCount = 3;
  var handle = "handle123";
  var datamapRaw = Object.entries(_datamap2.default.generate(handle, chunksCount, { raw: true }));

  expect(JSON.stringify(datamapRaw)).toEqual(JSON.stringify([["0", "handle123"], ["1", "\xAB\r i.?\x9E\x17\xB2\x1D\0\xC9`\xDF1$\xE1\xA1\xD62a\xA5\xE8|\xB7tT\xAD\xA9@\x8C\x10"], ["2", "\f\x86\xEC\x1C\x8C\xEF\x1C\xEB\xAE\xD4\xF2n\xE6\x12\xAF\xB0yv\x1DZ\x7F\x82\xBBl\xAD\x01\xA6]\xEC\x94@\0"], ["3", "\xC51\xF3R\fN\x97\xF1f\xFB\t\x97\xA4\xAFl\xC7\x19\xA3\xA1gI\xEB\nX\xFB~\xD7\x94\x93\xDD"]]));
});
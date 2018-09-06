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

test("Generates correct number of chunks with raw datamap", function () {
  var chunksCount = 3;
  var handle = "handle123";
  var datamapRaw = Object.entries(_datamap2.default.generate(handle, chunksCount, { raw: true }));

  expect(datamapRaw.length).toEqual(chunksCount + 1);
});
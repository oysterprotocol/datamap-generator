"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("iota.lib.js/lib/utils/utils");

var _utils2 = _interopRequireDefault(_utils);

var _index = require("../config/index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toAddress = function toAddress(string) {
  return string.substr(0, _index.IOTA_API.ADDRESS_LENGTH);
};

exports.default = {
  toAddress: toAddress,
  utils: _utils2.default
};
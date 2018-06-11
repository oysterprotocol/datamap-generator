"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iotaLib = require("iota.lib.js");

var _iotaLib2 = _interopRequireDefault(_iotaLib);

var _index = require("../config/index");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Iota = new _iotaLib2.default();
var toAddress = function toAddress(string) {
  return string.substr(0, _index.IOTA_API.ADDRESS_LENGTH);
};

exports.default = {
  toAddress: toAddress,
  utils: Iota.utils
};

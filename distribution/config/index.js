"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var API = (exports.API = Object.freeze({
  // HOST: "http://localhost:8000",
  // BROKER_NODE_A: "http://localhost:8000",
  // BROKER_NODE_B: "http://localhost:8000",
  HOST: "",
  BROKER_NODE_A: "",
  BROKER_NODE_B: "",
  V1_UPLOAD_SESSIONS_PATH: ":3000/api/v1/upload-sessions",
  V2_UPLOAD_SESSIONS_PATH: ":3000/api/v2/upload-sessions",
  CHUNKS_PER_REQUEST: 10
}));

var IOTA_API = (exports.IOTA_API = Object.freeze({
  PROVIDER_A: "http://18.188.17.130:14265",
  PROVIDER_B: "http://18.220.1.63:14265",
  PROVIDER_C: "http://18.216.90.80:14265",
  ADDRESS_LENGTH: 81,
  MESSAGE_LENGTH: 2187
}));

var UPLOAD_STATUSES = (exports.UPLOAD_STATUSES = Object.freeze({
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED"
}));

var DOWNLOAD_STATUSES = (exports.DOWNLOAD_STATUSES = Object.freeze({
  STANDBY: "STANDBY",
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
  FAILED: "FAILED"
}));

var FILE = (exports.FILE = Object.freeze({
  MAX_FILE_SIZE: 200 * 1000,
  CHUNKS_PER_SECTOR: 1000000,
  CHUNK_TYPES: {
    METADATA: "METADATA",
    FILE_CONTENTS: "FILE_CONTENTS"
  }
}));

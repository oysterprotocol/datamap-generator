const API = Object.freeze({
  // HOST: "http://localhost:8000",
  // BROKER_NODE_A: "http://localhost:8000",
  // BROKER_NODE_B: "http://localhost:8000",
  HOST: "",
  BROKER_NODE_A: "",
  BROKER_NODE_B: "",
  V1_UPLOAD_SESSIONS_PATH: ":3000/api/v1/upload-sessions",
  V2_UPLOAD_SESSIONS_PATH: ":3000/api/v2/upload-sessions",
  CHUNKS_PER_REQUEST: 10
});

const IOTA_API = Object.freeze({
  PROVIDER_A: "http://18.188.17.130:14265",
  PROVIDER_B: "http://18.220.1.63:14265",
  PROVIDER_C: "http://18.216.90.80:14265",
  ADDRESS_LENGTH: 81,
  MESSAGE_LENGTH: 2187
});

const UPLOAD_STATUSES = Object.freeze({
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED"
});

const DOWNLOAD_STATUSES = Object.freeze({
  STANDBY: "STANDBY",
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
  FAILED: "FAILED"
});

const FILE = Object.freeze({
  MAX_FILE_SIZE: 200 * 1000,
  CHUNKS_PER_SECTOR: 1000000,
  CHUNK_TYPES: {
    METADATA: "METADATA",
    FILE_CONTENTS: "FILE_CONTENTS"
  }
});

module.exports = {
  API,
  DOWNLOAD_STATUSES,
  FILE,
  IOTA_API,
  UPLOAD_STATUSES
};

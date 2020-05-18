"use strict";
const crypto = require("crypto");

const RANDOM_BYTES = 48;
// due to base64 padding, token length is RANDOM_BYTES * 4/3, a multiple of 4 with max 3 bytes padding
const AUTH_TOKEN_LEN = Math.ceil((RANDOM_BYTES * 4) / 3);

const createAuthToken = _ =>
  crypto.randomBytes(RANDOM_BYTES).toString("base64");

module.exports = {
  createAuthToken,
  AUTH_TOKEN_LEN
};

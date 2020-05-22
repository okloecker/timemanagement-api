"use strict";

const imm = require("object-path-immutable");

/**
 * Changes the
 */
const renameKey = (obj, key, newKey) =>
  obj
    ? imm
        .wrap(obj)
        .del(key)
        .set(newKey, obj[key])
        .value()
    : obj;

module.exports = { renameKey };

"use strict";
const config = global.include("config/config");
const mongoist = require("mongoist");

const db = mongoist(config.mongoDb.url, config.mongoDb.options);

module.exports = db;

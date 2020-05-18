"use strict";
const joi = require("@hapi/joi");
const db = global.include("db/db");
const newError = global.include("errors/createError");

const objectIdSchema = joi
  .string()
  .trim()
  .length(24) // hexadecimal MongoDB ObjectId
  .required();

module.exports = {
  objectIdSchema
};

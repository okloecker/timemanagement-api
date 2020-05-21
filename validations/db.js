"use strict";
const joi = require("@hapi/joi");

const objectIdSchema = joi
  .string()
  .label("Object ID")
  .trim()
  .length(24) // hexadecimal MongoDB ObjectId
  .required();

module.exports = {
  objectIdSchema
};

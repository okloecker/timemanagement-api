"use strict";
const joi = require("@hapi/joi");

const schema = joi.object({
  userId: joi
    .string()
    .trim()
    .hex()
    .length(24) // hexadecimal MongoDB ObjectId
    .required()
});

module.exports = schema;

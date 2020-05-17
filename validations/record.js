"use strict";
const joi = require("@hapi/joi");

const schema = joi.object({
  id: joi.string().guid(),

  startTime: joi
    .string()
    .trim()
    .isoDate()
    .required(),

  endTime: joi
    .string()
    .trim()
    .isoDate(),

  durationString: joi.string(),

  note: joi.string().trim()
});

module.exports = schema;

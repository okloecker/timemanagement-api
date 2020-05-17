"use strict";
const joi = require("@hapi/joi");

const schema = joi.object({
  id: joi.string().alter({
    put: schema => schema.guid().optional(),
    post: schema => schema.forbidden()
  }),

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

const putSchema = schema.tailor("put");
const postSchema = schema.tailor("post");

module.exports = { putSchema, postSchema };

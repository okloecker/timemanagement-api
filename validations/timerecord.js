"use strict";
const joi = require("@hapi/joi");
const mongoist = require("mongoist");

/*
 * Validate records and cast userId into MongoDB ObjectIDs, stripping "id"
 * after validation.
 * Use as input validation schema for records.
 * PUT operations must have an "id" field.
 * POST operations must _not_ have an "id" field.
 */
const schema = joi.object({
  id: joi.string().alter({
    put: putschema =>
      putschema
        .trim()
        .hex()
        .length(24)
        .required()
        .strip(), // MongoDB expects "_id" instead of "id"
    post: postschema => postschema.forbidden()
  }),

  tmpId: joi.string().alter({
    put: putschema => putschema.empty(null).strip()
  }),

  userId: joi
    .string()
    .trim()
    .hex()
    .length(24) // hexadecimal MongoDB ObjectId
    //eslint-disable-next-line -- ObjectId starts with uppercase letter
    .custom(value => mongoist.ObjectId(value), "userId to ObjectId")
    .required(),

  startTime: joi
    .date()
    .iso()
    .required(),

  endTime: joi
    .date()
    .iso()
    .empty(null)
    .greater(joi.ref("startTime")),

  durationMinutes: joi.number().empty(null),

  note: joi
    .string()
    .trim()
    .empty(""),

  deleted: joi
    .date()
    .iso()
    .empty(null)
});

const putSchema = schema.tailor("put");
const postSchema = schema.tailor("post");

module.exports = { putSchema, postSchema };

"use strict";
const joi = require("@hapi/joi");
const mongoist = require("mongoist");
const differenceInMinutes = require("date-fns/differenceInMinutes");
const roundToNearestMinutes = require("date-fns/roundToNearestMinutes");
const addSeconds = require("date-fns/addSeconds");

/*
 * Validate records and cast userId into MongoDB ObjectIDs, stripping "id"
 * after validation.
 * Use as input validation schema for records.
 * PUT operations must have an "id" field.
 * POST operations must _not_ have an "id" field.
 */

const roundMinutesDown = values => {
  return {
    ...values,
    startTime: roundToNearestMinutes(addSeconds(values.startTime, -30)),
    endTime: values.endTime
      ? roundToNearestMinutes(addSeconds(values.endTime, -30))
      : values.endTime
  };
};

const dateGreaterOrEqual = (values, helpers) => {
  if (
    !values.endTime ||
    (values.startTime &&
      values.endTime &&
      Math.abs(differenceInMinutes(values.endTime, values.startTime)) >= 0)
  ) {
    return values;
  } else throw new Error("End time must be equal or greater than start time");
};

const schema = joi
  .object({
    id: joi.string().alter({
      put: putschema =>
        putschema
          .trim()
          .hex()
          .length(24)
          .required()
          .strip(), // MongoDB expects "_id" instead of "id"
      post: postschema => postschema.guid()
    }),

    userId: joi
      .string()
      .trim()
      .hex()
      .length(24) // hexadecimal MongoDB ObjectId
      // eslint-disable-next-line -- ObjectId starts with uppercase letter
      .custom(value => mongoist.ObjectId(value), "userId to ObjectId")
      .required(),

    startTime: joi
      .date()
      .iso()
      .required(),

    endTime: joi
      .date()
      .iso()
      .empty(null),

    durationMinutes: joi.number().empty(null),

    note: joi
      .string()
      .trim()
      .empty(""),

    deleted: joi
      .date()
      .iso()
      .empty(null)
  })
  .custom(dateGreaterOrEqual)
  .custom(roundMinutesDown);

const putSchema = schema.tailor("put");
const postSchema = schema.tailor("post");

module.exports = {
  putSchema,
  postSchema
};

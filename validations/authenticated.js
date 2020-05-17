"use strict";
const debug = require("debug")("tm:authenticated");
const joi = require("@hapi/joi");
const db = global.include("db/db");
const newError = global.include("errors/createError");
const { AUTH_TOKEN_LEN_MIN, AUTH_TOKEN_LEN_MAX } = global.include(
  "util/authToken"
);

/**
 * Authentication object validation.
 */

/**
 * Find authToken in db.
 */
const getAuthTokenAsyncFromDb = async authToken => {
  const dbtoken = await db.authToken.findOne({ token: authToken });
  if (!dbtoken) {
    throw newError({
      message: "Invalid access token.",
      code: "INVALID_AUTH_TOKEN",
      status: 403
    });
  }

  return await dbTokenSchema.validateAsync(dbtoken);
};

const dbTokenSchema = joi.object({
  _id: joi.object().required(),
  ttl: joi.number().required(),
  created: joi.date().required(),
  expires: joi.date().required(),
  userId: joi.object().required(),
  token: joi.string().required()
});

const schema = joi
  .object({
    authToken: joi
      .string()
      .min(AUTH_TOKEN_LEN_MIN)
      .max(AUTH_TOKEN_LEN_MAX)
      .external(getAuthTokenAsyncFromDb)
      .required()
  })
  .required();

module.exports = schema;

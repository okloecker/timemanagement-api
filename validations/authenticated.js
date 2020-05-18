"use strict";
const debug = require("debug")("tm:authenticated");
const joi = require("@hapi/joi");
const db = global.include("db/db");
const newError = global.include("errors/createError");
const isAfter = require("date-fns/isAfter");
const { AUTH_TOKEN_LEN } = global.include("util/authToken");

/**
 * Authentication object validation.
 */

/**
 * Find authToken in db.
 */
const getAuthTokenAsyncFromDb = async authToken => {
  const dbtoken = await db.authToken.findOne({
    token: authToken
  });
  if (!dbtoken) {
    throw newError({
      message: "Invalid authorization token.",
      code: "AUTH_TOKEN_INVALID",
      status: 403
    });
  }
  if (isAfter(new Date(), dbtoken.expires))
    throw newError({
      message: "Authorization token expired.",
      code: "AUTH_TOKEN_EXPIRED",
      status: 403
    });

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
      .length(AUTH_TOKEN_LEN)
      .external(getAuthTokenAsyncFromDb)
      .required()
  })
  .required();

module.exports = schema;

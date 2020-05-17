"use strict";
const Joi = require("@hapi/joi");
const newError = global.include("errors/createError");

/**
 * User object validation for Login, Signup.
 */

const lookupUser = async username => {
  // TODO: await database query for username existence
  if (!username || username !== "tom") {
    throw newError(`Invalid username ${username}`, "INVALID_USERNAME");
  }
};

const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .lowercase()
    .external(lookupUser)
    .required(),

  password: Joi.string()
    .trim()
    .min(8)
    .max(78)
    .required(),

  email: Joi.string()
    .trim()
    .email({
      minDomainSegments: 2
    })
});

// same as loginSchema, but must have repeatPassword identical to password
const signupSchema = Joi.object({
  username: loginSchema.extract("username"),
  password: loginSchema.extract("password"),
  email: loginSchema.extract("email"),
  repeatPassword: Joi.ref("password")
}).with("password", "repeatPassword");

module.exports = {
  loginSchema,
  signupSchema
};

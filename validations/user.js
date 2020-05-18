"use strict";
const Joi = require("@hapi/joi");
const db = global.include("db/db");
const newError = global.include("errors/createError");

/**
 * User object validation for Login, Signup.
 */

const lookupUser = async username => {
  const user = await db.user.findOne({ username });
  if (!user) {
    return null;
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

const logoutSchema = Joi.object({
  userId: Joi.string()
    .trim()
    .length(24) // hexadecimal MongoDB ObjectId
    .required()
});

const checkUserDoesntExist = async username => {
  const user = await db.user.findOne({ username });
  if (user) {
    throw newError({
      message: "Username exists",
      code: "USER_EXISTS_ALREADY",
      status: 403
    });
  } else return undefined;
};

// same as loginSchema, but must have repeatPassword identical to password
const signupSchema = Joi.object({
  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .lowercase()
    .external(checkUserDoesntExist)
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
    }),
  repeatPassword: Joi.ref("password")
}).with("password", "repeatPassword");

module.exports = {
  loginSchema,
  signupSchema,
  logoutSchema
};

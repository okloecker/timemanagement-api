"use strict";
const Joi = require("@hapi/joi");
const newError = global.include("errors/createError");

/**
 * Authentication object validation.
 */

const getAuthTokenAsync = async authToken => {
  // TODO: await query db for authToken validity
  if (authToken !== "a4e23139-8a42-49f7-a262-b182f3e48772") {
    throw newError("Invalid authToken", "INVALID_AUTH_TOKEN");
  }
};

const schema = Joi.object({
  authToken: Joi.string()
    .guid()
    .external(getAuthTokenAsync)
    .required()
}).required();

module.exports = schema;

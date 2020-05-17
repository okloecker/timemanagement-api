"use strict";
const debug = require("debug")("tm:app");
const config = global.include("config/config");
const Joi = require("@hapi/joi");

/** Sanitize and standardize validation errors.
 */
const convertValidationErrorDetails = details => {
  return {
    validation: details.map(detail => ({
      message: detail.message,
      path: detail.path,
      value: detail.context.value
    }))
  };
};

/**
 * Handle ValidationErrors.
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof Joi.ValidationError) {
    if (config.isDevelopment) debug("ValidationError: %O", err.details);
    res.status(400).json({
      error: convertValidationErrorDetails(err.details)
    });
  } else next(err);
};

module.exports = validationErrorHandler;

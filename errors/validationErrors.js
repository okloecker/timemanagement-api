"use strict";
const debug = require("debug")("tm:validationErrors");
const config = global.include("config/config");
const Joi = require("@hapi/joi");

/**
 * Sanitize and standardize validation errors.
 */

/*
 * Reconstitute Joi error.details values safe for returning back to client.
 * Return only key and message back to client, not input data.
 */
const convertValidationErrorDetails = details => ({
  validation: details.map(detail => ({
    message: detail.message,
    key: detail.context.key || detail.context.main
  }))
});

/**
 * Handle ValidationErrors.
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof Joi.ValidationError) {
    const convertedError = convertValidationErrorDetails(err.details);
    if (config.isDevelopment) {
      debug("original: %O", err.details);
      debug("converted: %O", convertedError);
    }
    res.status(400).json({ error: convertedError });
  } else next(err);
};

module.exports = validationErrorHandler;

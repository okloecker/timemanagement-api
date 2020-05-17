"use strict";
const debug = require("debug")("tm:authenticated");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const authTokenValidation = global.include("validations/authenticated");

/**
 * Check each request for presence HTTP header "authToken".
 */
router.all("*", async (req, res, next) => {
  try {
    // Check existence of authToken in headers and check it against database.
    await authTokenValidation.validateAsync(
      { authToken: req.get("authToken") },
      {
        errors: { stack: config.isDevelopment }
      }
    );
    next();
  } catch (error) {
    if (config.isDevelopment) debug("authTokenValidation error=%O", error);
    next(error);
  }
});

module.exports = router;

"use strict";
const debug = require("debug")("tm:authenticated");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const authTokenValidation = global.include("validations/authenticated");

/**
 * Check each request for presence HTTP header "authToken".
 * userId for token is injected into Express "req" object.
 */
router.all("*", async (req, res, next) => {
  try {
    // Check existence of authToken in headers and check it against database.
    const validToken = await authTokenValidation.validateAsync(
      { authToken: req.get("authToken") },
      {
        errors: { stack: config.isDevelopment }
      }
    );
    // inject userId for token into req object as ObjectId
    // eslint-disable-next-line -- require-atomic-updates doesn't apply here
    req.userId = validToken.authToken.userId;
    next();
  } catch (error) {
    if (config.isDevelopment) debug("authTokenValidation=%O", error);
    next(error);
  }
});

module.exports = router;

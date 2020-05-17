"use strict";
const debug = require("debug")("tm:authenticated");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const validation = global.include("validations/authenticated");

router.all("*", async (req, res, next) => {
  try {
    await validation.validateAsync(
      { authToken: req.get("authToken") },
      {
        errors: { stack: config.isDevelopment }
      }
    );
    next();
  } catch (error) {
    if (config.isDevelopment) debug("validation error=%O", error.details);
    next(error);
  }
});

module.exports = router;

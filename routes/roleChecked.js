"use strict";
const debug = require("debug")("tm:roleChecked");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();
const newError = global.include("errors/createError");

const roleCheckedValidation = global.include("validations/roleChecked");

const MUTATING_METHODS = ["PUT", "POST", "DELETE"];

/**
 * Middleware:
 * Check each request body that its key "userId" is identical
 * to req.userId ObjectId.
 * Must come after "authenticated" middleware.
 * This could in future be extended to test for req.userId having access to
 * the resource by their role, e.g. project admin.
 */
router.all("*", async (req, res, next) => {
  try {
    if (MUTATING_METHODS.includes(req.method)) {
      const validBody = await roleCheckedValidation.validateAsync(req.body, {
        allowUnknown: true,
        errors: { stack: config.isDevelopment }
      });

      // we have a PUT, POST or DELETE operation
      if (validBody.userId !== req.userId.toString())
        throw newError({
          message: "Unauthorized",
          code: "RECORD_UPDATE_FAILED_WRONG_USER",
          status: 403
        });
    }

    next();
  } catch (error) {
    if (config.isDevelopment) debug("%O", error);
    next(error);
  }
});

module.exports = router;

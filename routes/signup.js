"use strict";
const debug = require("debug")("tm:signup");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();
const { signupSchema } = global.include("validations/user");

/*
 * Routes for signup
 */

router.postAsync("/signup", async (req, res) => {
  const {
    body: { username, password }
  } = req;
  const value = await signupSchema.validateAsync(req.body, {
    abortEarly: false,
    errors: { stack: config.isDevelopment }
  });
  debug("called with username %o", username);
  res.json({ ...value, password: undefined });
});

module.exports = router;

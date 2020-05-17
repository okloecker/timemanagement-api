"use strict";
const debug = require("debug")("tm:login");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const {loginSchema} = global.include("validations/user");

/**
 * Routes for login
 * @param {string} username the username
 * @param {string} password the password
 */
router.postAsync("/login", async (req, res) => {
  const {
    body: { username, password }
  } = req;

  debug("called with username %o", username);

  // validates and sanitizes input data
  const value = await loginSchema.validateAsync(req.body, {
    abortEarly: false,
    errors: { stack: config.isDevelopment }
  });

  // send back "good" data, but remove password
  res.json({ ...value, password: undefined });
});

module.exports = router;

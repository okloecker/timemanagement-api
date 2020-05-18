"use strict";
const debug = require("debug")("tm:login");
const addSeconds = require("date-fns/addSeconds");
const config = global.include("config/config");
const db = global.include("db/db");
const bcrypt = require("bcrypt");
const newError = global.include("errors/createError");
const { createAuthToken } = global.include("util/authToken");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const { loginSchema } = global.include("validations/user");

const mismatchError = newError({
  message: "This combination of user and password is not correct.",
  code: "USER_OR_PASSWORD_INCORRECT",
  status: 403
});

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

  const { password: passwordHash, _id: id } = await db.user.findOne({
    username: value.username
  });
  const passwordCorrect = await bcrypt.compare(value.password, passwordHash);
  if (!passwordCorrect) throw mismatchError;

  const now = new Date();
  const authToken = await db.authToken.insert({
    token: createAuthToken(),
    userId: id,
    created: now,
    ttl: config.authToken.ttl,
    expires: addSeconds(now, config.authToken.ttl)
  });

  // send back "good" data
  const returnAuthToken = {
    token: authToken.token,
    created: authToken.created,
    ttl: authToken.ttl,
    expires: authToken.expires
  };
  res.json({
    id,
    username: value.username,
    authToken: returnAuthToken,
    password: undefined
  });
});

module.exports = router;

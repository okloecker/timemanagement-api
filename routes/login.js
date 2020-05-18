"use strict";
// const debug = require("debug")("tm:login");
const addSeconds = require("date-fns/addSeconds");
const config = global.include("config/config");
const db = global.include("db/db");
const bcrypt = require("bcrypt");
const { createAuthToken } = global.include("util/authToken");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const { loginSchema, mismatchError } = global.include("validations/user");

/**
 * Routes for login
 * @param {string} username the username
 * @param {string} password the password
 */
router.postAsync("/login", async (req, res) => {
  // validates and sanitizes input data
  const value = await loginSchema.validateAsync(req.body, {
    abortEarly: false,
    errors: { stack: config.isDevelopment }
  });

  const { password: passwordHash, _id: id } =
    (await db.user.findOne({
      username: value.username
    })) || {};
  if (!passwordHash) throw mismatchError;
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

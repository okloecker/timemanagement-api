"use strict";
const debug = require("debug")("tm:signup");
const bcrypt = require("bcrypt");
const config = global.include("config/config");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();
const db = global.include("db/db");
const { signupSchema } = global.include("validations/user");

const saltRounds = 10;

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
  debug("validation value %O", value);

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await db.user.insert({
    username: value.username,
    password: passwordHash
  });
  debug("inserted user %o", user);

  res.json({
    data: { ...value, password: undefined, repeatPassword: undefined },
    message: "Signed up successfully."
  });
});

module.exports = router;

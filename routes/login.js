const debug = require("debug")("tm:login");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

const userValidation = global.include("validations/user.js");

/**
 * Routes for login
 */
router.postAsync("/login", async (req, res) => {
  const {
    body: { username, password }
  } = req;

  debug("called with username %o", username);

  const { error } = await userValidation.validateAsync(req.body, {
    abortEarly: false,
    errors: { stack: process.env.NODE_ENV === "development" }
  });

  if (error) res.status(400).json(error.details);

  if (!username)
    res.status(401).json({ error: { login: { username: "empty" } } });
  res.json({ username });
});

module.exports = router;

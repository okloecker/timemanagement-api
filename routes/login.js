const debug = require("debug")("tm:login");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

/*
 * Routes for login
 */

router.postAsync("/login", async (req, res) => {
  const {
    body: { username, password }
  } = req;
  debug("called with username %o", username);
  if (!username)
    res.status(401).json({ error: { login: { username: "empty" } } });
  res.json({ username});
});

module.exports = router;

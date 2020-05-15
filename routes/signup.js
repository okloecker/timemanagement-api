const debug = require("debug")("tm:signup");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

/*
 * Routes for signup
 */

router.postAsync("/signup", async (req, res) => {
  const {
    body: { username, password }
  } = req;
  debug("called with username %o", username);
  res.json({ username: req.body.username });
});

module.exports = router;

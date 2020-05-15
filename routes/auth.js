const debug = require("debug")("tm:auth");
const { Router } = require("@awaitjs/express");

const login = require("./login");
const signup = require("./signup");

// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

router.postAsync("*", async (req) => {
  debug("METHOD: %O, ROUTE: %O", req.method, req.originalUrl);
});

/*
 * Routes for authentication.
 */

router.use(login);
router.use(signup);

module.exports = router;

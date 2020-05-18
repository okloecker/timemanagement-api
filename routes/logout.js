"use strict";
const debug = require("debug")("tm:logout");
const config = global.include("config/config");
const db = global.include("db/db");
const mongoist = require("mongoist");
const newError = global.include("errors/createError");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();

// to logout, needs an authToken
const authenticated = global.include("routes/authenticated");
router.use(authenticated);

const { objectIdSchema } = global.include("validations/db");

/**
 * Route for logout
 * @param authToken - HTTP header
 * @param userId - POST body parameter {userId:...}
 */
router.postAsync("/", async (req, res) => {
  // validates and sanitizes input data
  const {
    body: { userId }
  } = req;
  const validUserId = await objectIdSchema.validateAsync(userId, {
    errors: { stack: config.isDevelopment }
  });
  const authToken = req.get("authToken");

  const userIdObjectId = mongoist.ObjectId(validUserId);
  const user = await db.user.findOne({ _id: userIdObjectId });

  const deleteResult = await db.authToken.remove(
    { token: authToken, userId: userIdObjectId },
    { justOne: true }
  );

  if (deleteResult.ok && deleteResult.deletedCount === 1)
    res.json({ message: "Logged out successfully." });
  else
    throw newError({
      message: "Logout failed",
      code: "LOGOUT_FAILED",
      status: 403
    });
});

module.exports = router;

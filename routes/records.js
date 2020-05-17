"use strict";
const debug = require("debug")("tm:records");
const config = global.include("config/config");
const { v4: uuidv4 } = require("uuid");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();
const newError = global.include("errors/createError");

const { putSchema, postSchema } = global.include("validations/record");
const authenticated = global.include("routes/authenticated");
router.use(authenticated);

router.getAsync("/", async (req, res) => {
  // TODO: query db for all records for this user
  debug("get /");
  res.json({ data: [{ id: 1, note: "one" }, { id: 2, note: "two" }] });
});

router.getAsync("/:id", async (req, res) => {
  // TODO: query db for record with "id"
  const {
    params: { id }
  } = req;
  debug("get /%s", id);
  res.json({ data: { id: 1, note: "one" } });
});

router.postAsync("/", async (req, res) => {
  // TODO: create new db entry for record
  const guid = uuidv4();
  const { error, value } = postSchema.validate(req.body);
  if (error) {
    throw error;
  } else {
    debug("post %O", value);
    res.json({ id: guid });
  }
});

router.putAsync("/:id", async (req, res) => {
  // TODO: update db entry for record
  const {
    params: { id }
  } = req;
  const { error, value } = putSchema.validate(req.body);
  if (error) {
    throw error;
  } else {
    debug("put %O", value);
    res.json({ id });
  }
});

module.exports = router;

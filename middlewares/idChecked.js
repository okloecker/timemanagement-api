"use strict";
const mongoist = require("mongoist");
const newError = global.include("errors/createError");

/** Middleware to verify the ":id" URL param against the "id" field in payload
 * This can't be called with router.use(), because at that point, the params
 * haven't been parsed yet.
 * So it has to be chained within the route.METHOD(..., idChecked, ...)
 */
const MUTATING_METHODS = ["PUT", "DELETE"]; // POST doesn't have id
const idChecked = async (req, res, next) => {
  if (MUTATING_METHODS.includes(req.method)) {
    const {
      params: { id }
    } = req;

    if (req.body.id !== id)
      throw newError({
        message: "IDs don't match",
        code: "RECORD_UPDATE_FAILED_ID_MISMATCH",
        status: 403
      });
  }

  next();
};

module.exports = idChecked;

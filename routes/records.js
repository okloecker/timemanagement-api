"use strict";
// const debug = require("debug")("tm:records");
const config = global.include("config/config");
const db = global.include("db/db");
const mongoist = require("mongoist");
const { Router } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();
const differenceInMinutes = require("date-fns/differenceInMinutes");
const newError = global.include("errors/createError");

const { putSchema, postSchema } = global.include("validations/record");
const { objectIdSchema } = global.include("validations/db");
const authenticated = global.include("routes/authenticated");
router.use(authenticated);

/**
 * Returns all records for authenticated user.
 */
router.getAsync("/", async (req, res) => {
  const records = await db.records.find({
    userId: req.userId
  });
  res.json({ data: records });
});

/**
 * Returns single record by id for authenticated user.
 */
router.getAsync("/:id", async (req, res) => {
  const {
    params: { id }
  } = req;
  const validRecordId = await objectIdSchema.validateAsync(id, {
    errors: { stack: config.isDevelopment }
  });
  const record = await db.records.findOne({
    //eslint-disable-next-line -- ObjectId starts with uppercase letter
    _id: mongoist.ObjectId(validRecordId)
  });
  if (!record) {
    throw newError({
      message: "Record not found.",
      code: "RECORD_NOT_FOUND",
      status: 404
    });
  }
  res.json({ data: record });
});

/**
 * Queries db for existing records which overlap time/date wise with given
 * record and (if provided) don't have the given "id".
 */
const findOverlap = async (record, id) =>
  db.records.find({
    userId: record.userId,
    startTime: { $lt: record.endTime },
    endTime: { $gt: record.startTime },
    _id: { $ne: id }
  });

/**
 * Creates a record for authenticated user.
 */
router.postAsync("/", async (req, res) => {
  const validRecord = await postSchema.validateAsync(req.body);
  const overlap = await findOverlap(validRecord);

  const durationMinutes = validRecord.endTime
    ? differenceInMinutes(validRecord.endTime, validRecord.startTime)
    : undefined;

  // userId will be ObjectID:
  const createdRecord = await db.records.save({
    ...validRecord,
    userId: validRecord.userId,
    durationMinutes
  });

  res.status(201).json({
    data: createdRecord,
    warning: overlap && overlap.length ? { overlap } : undefined
  });
});

/**
 * Updates a record by id for authenticated user.
 */
router.putAsync("/:id", async (req, res) => {
  const {
    params: { id }
  } = req;

  // Check that the payload "id" is identical to ":id" from URL
  if (req.body.id !== id)
    throw newError({
      message: "IDs don't match",
      code: "RECORD_UPDATE_FAILED_ID_MISMATCH",
      status: 403
    });

  // Check that the payload "userId" is identical to authenticated userId (both
  // are ObjectIds)
  const validRecord = await putSchema.validateAsync(req.body);
  if (!validRecord.userId.equals(req.userId))
    throw newError({
      message: "Unauthorized",
      code: "RECORD_UPDATE_FAILED_WRONG_USER",
      status: 403
    });

  //eslint-disable-next-line -- ObjectId starts with uppercase letter
  const idAsObjectId = mongoist.ObjectId(id);
  const overlap = await findOverlap(validRecord, idAsObjectId);

  const durationMinutes = validRecord.endTime
    ? differenceInMinutes(validRecord.endTime, validRecord.startTime)
    : undefined;

  const replaceRecord = {
    ...validRecord,
    userId: validRecord.userId,
    durationMinutes
  };

  const updatedRecord = await db.records.replaceOne(
    { _id: idAsObjectId, userId: validRecord.userId },
    {
      _id: idAsObjectId,
      ...replaceRecord
    }
  );

  if (!updatedRecord.result.ok || updatedRecord.result.n !== 1)
    throw newError({ message: "Update failed.", code: "RECORD_UPDATE_FAILED" });

  res.json({
    data: { id, ...replaceRecord },
    warning: overlap && overlap.length ? { overlap } : undefined
  });
});

/*
 * Marks a record as deleted to be purged at a later date (or for an undo
 * operation).
 */
router.deleteAsync("/:id", async (req, res) => {
  const {
    params: { id }
  } = req;
  //eslint-disable-next-line -- ObjectId starts with uppercase letter
  const idAsObjectId = mongoist.ObjectId(id);

  // only mark deleted if not yet deleted
  const record = await db.records.findOne({
    _id: idAsObjectId,
    userId: req.userId
  });
  if (!record)
    throw newError({
      message: "Record unknown",
      code: "RECORD_UNKNOWN",
      status: 404
    });

  if (!(record || {}).deleted) {
    await db.records.update(
      { _id: idAsObjectId },
      { $currentDate: { deleted: true } }
    );
  }
  const newRecord = await db.records.findOne({
    _id: idAsObjectId,
    userId: req.userId
  });

  // eslint-disable-next-line -- removing _id but not using it
  const { _id, ...rest } = newRecord;
  res.json({
    data: { id, ...rest }
  });
});

module.exports = router;

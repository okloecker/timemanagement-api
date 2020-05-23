"use strict";
const debug = require("debug")("tm:records");
const db = global.include("db/db");
const mongoist = require("mongoist");
const parseISO = require("date-fns/parseISO");
const isValid = require("date-fns/isValid");
const { Router, wrap } = require("@awaitjs/express");
// eslint-disable-next-line -- Router starts with uppercase
const router = Router();
const differenceInMinutes = require("date-fns/differenceInMinutes");
const newError = global.include("errors/createError");

const { objectIdSchema } = global.include("validations/db");
const config = global.include("config/config");
const { putSchema, postSchema } = global.include("validations/timerecord");
const { renameKey } = global.include("util/object");
const authenticated = global.include("routes/authenticated");
const roleChecked = global.include("routes/roleChecked");
const idChecked = global.include("middlewares/idChecked");
router.use(authenticated);
router.use(roleChecked);

/**
 * Inject the "id" param cast to MongoDB ObjectId as "idAsObjectId" into
 * req.
 */
router.param(
  "id",
  wrap(async (req, res, next) => {
    const {
      params: { id }
    } = req;
    await objectIdSchema.validateAsync(id, {
      errors: { stack: config.isDevelopment }
    });
    //eslint-disable-next-line -- ObjectId starts with uppercase letter
    req.idAsObjectId = mongoist.ObjectId(id);
    next();
  })
);

/**
 * Returns all records for authenticated user.
 */
router.getAsync("/", async (req, res) => {
  const {
    query: { dateFrom, dateTo, contains }
  } = req;

  const from = parseISO(dateFrom);
  const to = parseISO(dateTo);

  // construct query: only undeleted records, and if "dateFrom" is given, startTime
  // must be on or after that; if "dateTo" is given, the whole record must be
  // inside the filter window, unless "endTime" is unset, in which case it
  // should be returned
  const dbquery = {
    userId: req.userId,
    deleted: null
  };
  if (isValid(from)) dbquery.startTime = { $gte: from };
  if (isValid(to))
    dbquery.$or = [
      { endTime: { $lte: to } },
      { endTime: { $exists: false } },
      { endTime: null }
    ];
  if (contains) dbquery.note = { $regex: `${contains}`, $options: "i" };

  const records = await db.timerecords.find(dbquery);
  const returnRecords = records.map(r => renameKey(r, "_id", "id"));
  res.json({ data: returnRecords });
});

/**
 * Returns single record by id for authenticated user.
 */
router.getAsync("/:id", async (req, res) => {
  const record = await db.timerecords.findOne({
    //eslint-disable-next-line -- ObjectId starts with uppercase letter
    _id: req.idAsObjectId
  });
  if (!record) {
    throw newError({
      message: "Record not found.",
      code: "RECORD_NOT_FOUND",
      status: 404
    });
  }
  res.json({ data: renameKey(record, "_id", "id") });
});

/**
 * Queries db for existing records which overlap time/date wise with given
 * record and (if provided) don't have the given "id".
 */
const findOverlap = async (record, id) =>
  db.timerecords.find({
    userId: record.userId,
    startTime: { $lt: record.endTime },
    endTime: { $gt: record.startTime },
    _id: { $ne: id }
  });

/**
 * Creates a record for authenticated user.
 */
router.postAsync("/", idChecked, async (req, res) => {
  const validRecord = await postSchema.validateAsync(req.body);
  const overlap = await findOverlap(validRecord);

  const durationMinutes = validRecord.endTime
    ? differenceInMinutes(validRecord.endTime, validRecord.startTime)
    : undefined;

  // userId will be ObjectID:
  const createdRecord = await db.timerecords.save({
    ...validRecord,
    durationMinutes,
    tmpId: undefined
  });

  // eslint-disable-next-line -- removing _id but not using it
  res.status(201).json({
    data: {
      ...renameKey(createdRecord, "_id", "id"),
      tmpId: validRecord.tmpId
    },
    warning: overlap && overlap.length ? { overlap } : undefined
  });
});

/**
 * Updates a record by id for authenticated user.
 */
router.putAsync("/:id", idChecked, async (req, res) => {
  const {
    params: { id }
  } = req;

  // Check that the payload "userId" is identical to authenticated userId (both
  // are ObjectIds)
  const validRecord = await putSchema.validateAsync(req.body);

  const overlap = await findOverlap(validRecord, req.idAsObjectId);

  const durationMinutes = validRecord.endTime
    ? differenceInMinutes(validRecord.endTime, validRecord.startTime)
    : undefined;

  const replaceRecord = {
    ...validRecord,
    userId: validRecord.userId,
    durationMinutes
  };

  const updatedRecord = await db.timerecords.replaceOne(
    { _id: req.idAsObjectId, userId: validRecord.userId },
    {
      _id: req.idAsObjectId,
      ...replaceRecord
    }
  );

  if (updatedRecord.result.n !== 1) {
    throw newError({
      message: "Record to update not found.",
      code: "RECORD_UPDATE_FAILED_NOT_FOUND"
    });
  }
  if (!updatedRecord.result.ok) {
    throw newError({ message: "Update failed.", code: "RECORD_UPDATE_FAILED" });
  }

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

  // only mark deleted if not yet deleted
  const record = await db.timerecords.findOne({
    _id: req.idAsObjectId,
    userId: req.userId
  });
  if (!record)
    throw newError({
      message: "Record unknown",
      code: "RECORD_UNKNOWN",
      status: 404
    });

  if (!(record || {}).deleted) {
    await db.timerecords.update(
      { _id: req.idAsObjectId },
      { $currentDate: { deleted: true } }
    );
  }
  const newRecord = await db.timerecords.findOne({
    _id: req.idAsObjectId,
    userId: req.userId
  });

  res.json({
    data: renameKey(newRecord, "_id", "id")
  });
});

router.putAsync("/:id/undelete", idChecked, async (req, res) => {
  const {
    params: { id }
  } = req;

  await db.timerecords.update(
    { _id: req.idAsObjectId },
    { $set: { deleted: undefined } }
  );

  const newRecord = await db.timerecords.findOne({
    _id: req.idAsObjectId,
    userId: req.userId
  });

  if (!newRecord)
    throw newError({
      message: "Record unknown",
      code: "RECORD_UNKNOWN",
      status: 404
    });

  res.json({
    data: renameKey(newRecord, "_id", "id")
  });
});

module.exports = router;

"use strict";
const debug = require("debug")("tm:app");
const express = require("express");
const { addAsync } = require("@awaitjs/express");
const app = addAsync(express());
const helmet = require("helmet");

/* Helper for global absolute require.
 * use with:
 * include('validations/user.js');
 * https://coderwall.com/p/th6ssq/absolute-paths-require
 */
global.baseDir = __dirname;
global.absPath = function(path) {
  // eslint-disable-next-line
  return baseDir + path;
};
global.include = function(file) {
  // eslint-disable-next-line
  return require(absPath(`/${file}`));
};

const validationErrorHandler = require("./errors/validationErrors");
const config = require("./config/config");
const auth = require("./routes/auth");
const records = require("./routes/records");

// Sends JSON prettified to caller:
if (config.isDevelopment) app.set("json spaces", 2);

// Clean response headers for security:
app.use(helmet());

// Used to parse JSON bodies Node.js 4.16+
app.use(express.json());

// API routes:
app.use("/auth", auth);
app.use("/records", records);

/**
 * Log all requests for AAA
 */
app.postAsync("*", async req => {
  debug("METHOD: %O, ROUTE: %O", req.method, req.originalUrl);
});

/**
 * Handle unknown GET routes
 */
app.getAsync("*", async req => {
  throw new Error(`Unknown route ${req.url}`);
});

/**
 * Handle unknown POST routes
 */
app.postAsync("*", async req => {
  throw new Error(`Unknown route ${req.url}`);
});

/**
 * Handle unknown PUT routes
 */
app.putAsync("*", async req => {
  throw new Error(`Unknown route ${req.url}`);
});

/*
 * Error handling middlewares must come after other routes and middlewares.
 */

/**
 * Handle ValidationErrors
 */
app.use(validationErrorHandler);

/**
 * Log all caught errors.
 */
app.use((err, req, res, next) => {
  debug("Caught: %O", config.isDevelopment ? err : err.message);
  next(err);
});

/**
 * Handle other errors.
 */
// eslint-disable-next-line -- must include "next" parameter, otherwise Express will not treat this function as error handling middleware
app.use((err, req, res, next) => {
  res
    .status(err.status || 400)
    .json({ error: { message: err.message, code: err.code } });
});

app.listen(config.server.port, () =>
  console.log(
    `Timemanagement API listening at http://localhost:${config.server.port}`
  )
);

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
const newError = global.include("errors/createError");

const auth = require("./routes/auth");
const records = require("./routes/records");
const logout = require("./routes/logout");

// Sends JSON prettified to caller:
if (config.isDevelopment) app.set("json spaces", 2);

// Clean response headers for security:
app.use(helmet());

// Used to parse JSON bodies Node.js 4.16+
app.use(express.json());

/**
 * Log all requests for AAA
 */
app.all("*", async (req, res, next) => {
  debug("AAA %O %O", req.method, req.originalUrl);
  next();
});

// API routes:
app.use("/api/auth", auth);
app.use("/api/records", records);
app.use("/api/logout", logout);

/**
 * Handle unknown GET routes
 */
app.getAsync("*", async req => {
  throw newError({message:`Unknown route ${req.url}`, status: 404});
});

/**
 * Handle unknown POST routes
 */
app.postAsync("*", async req => {
  throw newError({message:`Unknown route ${req.url}`, status: 404});
});

/**
 * Handle unknown PUT routes
 */
app.putAsync("*", async req => {
  throw newError({message:`Unknown route ${req.url}`, status: 404});
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

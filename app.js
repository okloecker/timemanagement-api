const debug = require("debug")("tm:app");
const express = require("express");
const { addAsync } = require("@awaitjs/express");
const app = addAsync(express());
const helmet = require("helmet");
const validationErrorHandler = require("./errors/validationErrors");

const port = 3001;

app.use(helmet());
app.use(express.json()); // Used to parse JSON bodies Node.js 4.16+

/* Helper for global absolute require.
 * use with:
 * include('validations/user.js');
 * https://coderwall.com/p/th6ssq/absolute-paths-require
 */
global.base_dir = __dirname;
global.abs_path = function(path) {
  // eslint-disable-next-line
  return base_dir + path;
};
global.include = function(file) {
  // eslint-disable-next-line
  return require(abs_path(`/${file}`));
};

const auth = require("./routes/auth");
app.use("/auth", auth);

/**
 * Log all requests for AAA
 */
app.postAsync("*", async req => {
  debug("METHOD: %O, ROUTE: %O", req.method, req.originalUrl);
});

/**
 * Handle unknown GET routes
 */
app.getAsync("*", async (/*req, res, next*/) => {
  throw new Error("Unknown route!");
});

/**
 * Handle unknown POST routes
 */
app.postAsync("*", async req => {
  throw new Error(`Unknown route ${req.url}`);
});

/*
 * Error handling middlewares must come after other routes and middlewares.
 */

/**
 * Log all caught errors.
 */
app.use((err, req, res, next) => {
  debug("Caught: %O", err);
  next(err);
});

/**
 * Handle ValidationErrors
 */
app.use(validationErrorHandler);

/**
 * Handle other errors.
 */
// eslint-disable-next-line -- must include "next" parameter, otherwise Express will not treat this function as error handling middleware
app.use((err, req, res, next) => {
  res.status(400).json({ error: { message: err.message } });
});

app.listen(port, () =>
  console.log(`Timemanagement API listening at http://localhost:${port}`)
);

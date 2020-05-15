const debug = require("debug")("tm:app");
const express = require("express");
const { addAsync } = require("@awaitjs/express");
const app = addAsync(express());
const helmet = require("helmet");

const port = 3001;

const auth = require("./routes/auth");

app.use(helmet());
app.use(express.json()); // Used to parse JSON bodies Node.js 4.16+

app.use("/auth", auth);

/*
 * Log all requests for AAA
 */
app.postAsync("*", async req => {
  debug("METHOD: %O, ROUTE: %O", req.method, req.originalUrl);
});

/*
 * Handle unknown GET routes
 */
app.getAsync("*", async (/*req, res, next*/) => {
  throw new Error("Unknown route!");
});

/*
 * Handle unknown POST routes
 */
app.postAsync("*", async req => {
  throw new Error(`Unknown route ${req.url}`);
});

/*
 * Log errors
 */
app.use((err, req, res, next) => {
  debug("Caught: %O", err);
  res.status(400).json({ error: { message: err.message } });
});

app.listen(port, () =>
  console.log(`Timemanagement API listening at http://localhost:${port}`)
);

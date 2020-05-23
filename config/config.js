"use strict";
const debug = require("debug")("tm:config");
const joi = require("@hapi/joi");

// required environment variables
const envVarsSchema = joi
  .object({
    TZ: joi.string().default("UTC"),
    NODE_ENV: joi
      .string()
      .allow("development", "production", "test")
      .required(),
    PORT: joi
      .number()
      .empty("")
      .default(3001),
    MONGODB_URL: joi.string().required()
  })
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(
    `Config validation error: ${
      error.message
    }, check your environment variables`
  );
}

const config = {
  env: envVars.NODE_ENV,
  tz: envVars.TZ,
  isDevelopment: envVars.NODE_ENV === "development",
  isProduction: envVars.NODE_ENV === "production",
  server: {
    port: envVars.PORT
  },
  mongoDb: {
    url: envVars.MONGODB_URL,
    options: {}
  },
  authToken: {
    ttl: 60 * 60 * 24 * 14 // 14 days
  }
};
debug("Config:", config);

module.exports = config;

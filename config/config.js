"use strict";
const debug = require("debug")("tm:config");
const joi = require("@hapi/joi");

// required environment variables
const envVarsSchema = joi
  .object({
    NODE_ENV: joi
      .string()
      .allow("development", "production", "test", "provision")
      .required(),
    PORT: joi
      .number()
      .empty("")
      .default(3000)
  })
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  isDevelopment: envVars.NODE_ENV === "development",
  isProduction: envVars.NODE_ENV === "production",
  server: {
    port: Number(envVars.PORT || 3000)
  }
};
debug("Config:", config);

module.exports = config;

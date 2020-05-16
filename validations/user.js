const Joi = require("@hapi/joi");

/**
 * User object validation for Login, Signup.
 */

const schema = Joi.object({
  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  password: Joi.string()
    .trim()
    .min(8)
    .max(78)
    .required(),

  repeat_password: Joi.ref("password"),

  auth_token: [Joi.string(), Joi.string().guid()],

  email: Joi.string()
    .trim()
    .email({
      minDomainSegments: 2
    })
})
  .xor("password", "auth_token")
  .with("password", "repeat_password");

module.exports = schema;

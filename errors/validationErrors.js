const Joi = require("@hapi/joi");

/**
 * Handle ValidationErrors.
 * Will return an object similar to this shape:
 *
[
  {
    "message": "\"username\" length must be at least 3 characters long",
    "path": ["username"],
    "type": "string.min",
    "context": {
      "limit": 3,
      "value": "TO",
      "label": "username",
      "key": "username"
    }
  },
  {
    "message": "\"password\" length must be at least 8 characters long",
    "path": ["password"],
    "type": "string.min",
    "context": {
      "limit": 8,
      "value": "secret",
      "label": "password",
      "key": "password"
    }
  },
  {
    "message": "\"password\" missing required peer \"repeat_password\"",
    "path": [],
    "type": "object.with",
    "context": {
      "main": "password",
      "mainWithLabel": "password",
      "peer": "repeat_password",
      "peerWithLabel": "repeat_password",
      "label": "value",
      "value": { "username": "TO", "password": "secret" }
    }
  }
]
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof Joi.ValidationError)
    res.status(400).json({ error: err.details });
  else next(err);
};

module.exports = validationErrorHandler;

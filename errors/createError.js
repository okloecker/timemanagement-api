const newError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

module.exports = newError;

const newError = ({message, code, status=400}) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
};

module.exports = newError;

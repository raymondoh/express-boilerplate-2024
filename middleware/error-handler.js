const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific known errors

  // Invalid credentials error
  if (err.message === "Invalid credentials") {
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: err.message });
  }

  // Mongoose CastError for invalid IDs
  if (err.name === "CastError") {
    return res.status(StatusCodes.BAD_REQUEST).send({ message: "Invalid ID" });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    let messages = {};
    for (field in err.errors) {
      messages[field] = err.errors[field].message;
    }
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Validation error", errors: messages });
  }

  // Default to 500 Internal Server Error for other cases
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    message: "Internal Server Error",
    error: err.message
  });
};

module.exports = errorHandlerMiddleware;

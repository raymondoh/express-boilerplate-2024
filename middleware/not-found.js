const { StatusCodes } = require("http-status-codes");

const notFound = (req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).send({ message: "Route not found" });
};

module.exports = notFound;

const { verifyJWT } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");

const authenticateToken = (req, res, next) => {
  // Get the token from signed cookies or Authorization header
  const token = req.signedCookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  console.log("Token retrieved from request:", token);

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication invalid: No token provided" });
  }

  try {
    const payload = verifyJWT({ token });
    console.log("Token payload:", payload);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication invalid: Token verification failed" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };

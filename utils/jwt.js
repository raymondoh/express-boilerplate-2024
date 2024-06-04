const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME
  });
};

const verifyJWT = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookieToResponse = ({ res, user }) => {
  const token = createJWT({ payload: { userId: user._id, role: user.role } });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    signed: true
  });
  return token; // Return the token for development purposes
};

module.exports = {
  createJWT,
  verifyJWT,
  attachCookieToResponse
};

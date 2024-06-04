// Import packages
const express = require("express");
const router = express.Router();

// Import controllers
const {
  register,
  verifyEmail,
  resendVerificationEmail,
  resetPassword,
  requestPasswordReset,
  login,
  logout,
  dashboard
} = require("../controllers/authController");

// Import middleware
const { authenticateToken } = require("../middleware/authenticateToken");

// Set up routes
router.route("/register").post(register);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/request-password-reset").post(requestPasswordReset);
router.route("/reset-password").post(resetPassword);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/dashboard").get(authenticateToken, dashboard);

// Export router
module.exports = router;

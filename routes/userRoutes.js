// Import packages
const express = require("express");
const router = express.Router();

// Import controllers
const {
  getAllUsers,
  getCurrentUser,
  getUser,
  updateUser,
  updatePassword,
  deleteUser
} = require("../controllers/userController");
// Import middleware
const { authenticateToken, authorizeRoles } = require("../middleware/authenticateToken");

// Set up routes
router.route("/").get(authorizeRoles("admin"), getAllUsers);
router.route("/current-user").get(authenticateToken, getCurrentUser);
router.route("/update-user-password").patch(authenticateToken, updatePassword);

router.route("/:id").get(authenticateToken, getUser).patch(authenticateToken, updateUser).delete(deleteUser);

// Export router
module.exports = router;

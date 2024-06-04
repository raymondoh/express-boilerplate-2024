// Import packages
const express = require("express");
const router = express.Router();

// Import controllers
const { getAllJobs, getJob, createJob, updateJob, deleteJob } = require("../controllers/jobController");

// Import middleware
//const authenticateToken = require("../middleware/authenticateToken");

// Set up routes
router.route("/").get(getAllJobs).post(createJob);
router.route("/:id").get(getJob).patch(updateJob).delete(deleteJob);

// Export router
module.exports = router;

const Job = require("../models/JobModel");
const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");

// Get all jobs static
const getAllJobsStatic = async (req, res) => {
  const userId = req.user.userId;
  const jobs = await Job.find({ createdBy: userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};
// Get all jobs
const getAllJobs = async (req, res) => {
  const { company, position, status, sort, fields, page = 1, limit = 10 } = req.query;
  const queryObject = {};

  // Add filtering criteria
  if (company) {
    queryObject.company = company;
  }
  if (position) {
    queryObject.position = position;
  }
  if (status) {
    queryObject.status = status;
  }

  let result = Job.find(queryObject);

  // Sort results
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  }

  // Select specific fields
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  // Pagination
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(Number(limit));

  try {
    const jobs = await result;
    res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Get all liked jobs
const getAllLikedJobs = async (req, res) => {
  const userId = req.user.userId;
  // Find the user and populate the likedJobs field
  const user = await User.findById(userId).populate("likedJobs");
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }
  res.status(StatusCodes.OK).json({ jobs: user.likedJobs });
};
// Create a job - 2 methods to create a job - Job.create() or job.save()
const createJob = async (req, res) => {
  const { company, position, description } = req.body;
  const userId = req.user.userId;

  const job = new Job({
    company,
    position,
    description,
    createdBy: userId
  });

  await job.save();
  res.status(StatusCodes.CREATED).json({ job });
};
// Get a job
const getJob = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;

  const job = await Job.findOne({ _id: jobId, createdBy: userId });

  if (!job) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Job not found" });
  }

  res.status(StatusCodes.OK).json({ job });
};

// Update a job
const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  const { company, position, description } = req.body;

  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    { company, position, description },
    { new: true, runValidators: true }
  );

  if (!job) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Job not found" });
  }

  res.status(StatusCodes.OK).json({ job });
};

// Delete a job
const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;

  const job = await Job.findOneAndDelete({ _id: jobId, createdBy: userId });

  if (!job) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Job not found" });
  }

  res.status(StatusCodes.OK).json({ message: "Job deleted" });
};

module.exports = { getAllJobsStatic, getAllJobs, getAllLikedJobs, getJob, createJob, updateJob, deleteJob };

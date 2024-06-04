const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");

// Get all users
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users, count: users.length });
};
// get current user
const getCurrentUser = async (req, res) => {
  // Retrieve the user details from the database using the userId
  const user = await User.findById(req.user.userId).select("-password"); // Exclude the password field

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ user });
};

// Get user by ID
const getUser = async (req, res) => {
  const { id: userId } = req.params;

  // Ensure the user is authorized to access the profile
  if (req.user.userId !== userId && req.user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized to access this route" });
  }

  // Fetch the user from the database
  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ user });
};

// Update a user
const updateUser = async (req, res) => {
  const { id: userId } = req.params;
  const { username, email } = req.body;

  // Validate the input
  if (!username || !email) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Name and email are required" });
  }

  // Optionally, validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email format" });
  }

  // Ensure the user is authorized to update the profile
  if (req.user.userId !== userId && req.user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized to update this user" });
  }

  // Update the user in the database
  const user = await User.findOneAndUpdate({ _id: userId }, { username, email }, { new: true, runValidators: true });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ user });
};

const updatePassword = async (req, res) => {
  const userId = req.user.userId; // Get userId from req.user
  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Old and new passwords are required" });
  }

  // Find the user by ID
  const user = await User.findById(userId);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  // Validate the old password
  const isPasswordCorrect = await user.comparePasswords(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Old password is incorrect" });
  }

  // Ensure the new password is different from the old password
  if (oldPassword === newPassword) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "New password must be different from the old password" });
  }

  // Update the user's password
  user.password = newPassword;
  await user.save(); // The pre('save') hook in the model will handle hashing

  res.status(StatusCodes.OK).json({ message: "Password updated successfully" });
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id: userId } = req.params;

  const user = await User.findOneAndDelete({ _id: userId });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ message: "User deleted}" });
};

module.exports = {
  getAllUsers,
  getCurrentUser,
  updatePassword,
  getUser,
  updateUser,
  deleteUser
};

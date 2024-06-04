const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const { attachCookieToResponse, sendVerificationEmail } = require("../utils");

// create a new user
const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate the input
  if (!username || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({ message: "User already exists" });
    }

    // Determine the role for the new user
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? "admin" : "user";

    // Create the user with the determined role
    const user = new User({ username, email, password, role });
    const token = user.generateVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `http://localhost:3001/api/v1/auth/verify-email?token=${token}`;
    await sendVerificationEmail(email, verificationUrl);

    // Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(StatusCodes.CREATED).json({
      user: userWithoutPassword,
      message: "Registration successful, please check your email to verify your account"
    });
  } catch (error) {
    next(error);
  }
};

// verify user email
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  // Find user by verification token
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid or expired verification token" });
  }

  // Verify user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  // Generate JWT and set cookie
  attachCookieToResponse({ res, user });

  res
    .status(StatusCodes.OK)
    .json({ message: "Email verified successfully", user: { username: user.username, email: user.email } });
};
const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  // Validate the input
  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "This account is already verified" });
    }

    // Generate a new verification token
    const token = user.generateVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `http://localhost:3001/api/v1/auth/verify-email?token=${token}`;
    await sendVerificationEmail(email, verificationUrl);

    res
      .status(StatusCodes.OK)
      .json({ message: "Verification email resent, please check your email to verify your account" });
  } catch (error) {
    next(error);
  }
};
const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:3001/api/v1/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.status(StatusCodes.OK).json({ message: "Password reset email sent, please check your email" });
  } catch (error) {
    next(error);
  }
};
const resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Token and new password are required" });
  }

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid or expired password reset token" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({ message: "Password has been reset" });
  } catch (error) {
    next(error);
  }
};

// login user
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate the input
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Please verify your email to log in" });
    }

    // Compare the provided password with the hashed password in the database using the method from the model
    const isPasswordCorrect = await user.comparePasswords(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    // Attach cookie using the utility function
    attachCookieToResponse({ res, user });

    // Return the token and user information (excluding the password)
    res
      .status(StatusCodes.OK)
      .json({ message: "User logged in", user: { username: user.username, email: user.email } });
  } catch (error) {
    next(error);
  }
};
// log out user
const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict"
    });

    // Send a JSON response
    res.status(StatusCodes.OK).json({ message: "User logged out" });
  } catch (error) {
    // Optional: Handle potential errors
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while logging out" });
  }
};

const dashboard = async (req, res) => {
  res.send("Welcome to the dashboard");
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  resetPassword,
  login,
  logout,
  dashboard
};

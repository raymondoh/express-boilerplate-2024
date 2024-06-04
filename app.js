require("dotenv").config();
require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const connectDB = require("./db/connect");
const { authenticateToken } = require("./middleware/authenticateToken");
const { attachCookieToResponse } = require("./utils/jwt"); // code out this line

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const jobsRouter = require("./routes/jobRoutes");
const productRouter = require("./routes/productRoutes");
//
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
);
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(express.static("./public"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());

// Test route to set a cookie
app.get("/api/v1/test-cookie", (req, res) => {
  // Simulate a user object
  const user = { _id: "testUserId", role: "user" };

  // Attach the token to the response as a cookie
  attachCookieToResponse({ res, user }); // code out this line

  res.status(200).json({ message: "Cookie set successfully" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateToken, jobsRouter); // Protect all routes in this router
app.use("/api/v1/users", authenticateToken, userRouter); // Protect all routes in this router
app.use("/api/v1/products", productRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;

// db/connect.js
require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/JobModel"); //change this to your model
const jsonData = require("./mock-data.json"); //change this to your json file

const start = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Clear existing data (optional, to avoid duplicates)
    await Job.deleteMany(); //change this to your model
    console.log("Existing data cleared.");

    // Insert data from JSON
    await Job.insertMany(jsonData); //change this to your model
    console.log("Data successfully inserted.");

    // Exit process
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

start();

//type: node populate.js

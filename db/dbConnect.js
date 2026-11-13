const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function dbConnect() {
  const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/photo_sharing";
  try {
    await mongoose.connect(dbUrl);
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas!", error);
  }
}

module.exports = dbConnect;

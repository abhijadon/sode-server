"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Course } = require("../model/Course");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode";

async function clearAllCourses() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 Connected to MongoDB.");

    const res = await Course.deleteMany({});
    console.log(`🗑️ Deleted ${res.deletedCount} courses from database.`);

    console.log("✨ Courses collection is now empty and fresh.");
  } catch (err) {
    console.error("❌ Error clearing courses:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
  }
}

clearAllCourses();

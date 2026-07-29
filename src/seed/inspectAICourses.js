"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Category } = require("../model/Category");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const cat = await Category.findOne({ slug: "browse-ai-courses" });
    console.log("Found AI Courses Category:", cat);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

main();

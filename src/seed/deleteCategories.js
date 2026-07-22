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

    const res = await Category.deleteMany({});
    console.log(`Deleted ${res.deletedCount} categories.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

main();

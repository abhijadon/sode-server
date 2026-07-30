"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Category } = require("../model/Category");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const slugsToDelete = [
      "dual",
      "machine-learning",
      "data-science",
      "hr",
      "finance",
      "management",
      "leadership",
      "banking"
    ];

    const res = await Category.deleteMany({ slug: { $in: slugsToDelete } });
    console.log(`Successfully deleted ${res.deletedCount} duplicate category documents.`);

    const remaining = await Category.find({ removed: false }).lean();
    console.log(`Remaining Categories Count: ${remaining.length}`);
  } catch (err) {
    console.error("Error deleting categories:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main();

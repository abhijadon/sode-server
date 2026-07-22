"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Media } = require("../model/Media");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const totalBefore = await Media.countDocuments({});
    console.log(`Total Media documents before deletion: ${totalBefore}`);

    // Delete Media documents whose url does NOT contain the MinIO IP '172.236.183.64'
    const res = await Media.deleteMany({
      url: { $not: /172\.236\.183\.64/ }
    });

    console.log(`Deleted ${res.deletedCount} static Media documents.`);
    const totalAfter = await Media.countDocuments({});
    console.log(`Total Media documents remaining: ${totalAfter}`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

main();

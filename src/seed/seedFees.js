"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Fee } = require("../model/Fee");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function formatINR(num) {
  return "₹" + num.toLocaleString("en-IN");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const feeAmounts = [
  99000,
  129800,
  140000,
  160000,
  175000,
  180000,
  194700,
  199000,
  200000,
  225000,
  292640,
  310000,
  365000,
  485000,
  510000,
  535000,
  650000,
  680000,
  715000,
  750000,
  950000,
  950001,
  950002,
  1065000,
  1170000,
  1200000,
];

async function seedFees() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing old Fee collection...");
    try {
      await mongoose.connection.db.collection("fees").dropIndexes();
    } catch (e) {}

    const resFee = await Fee.deleteMany({});
    console.log(`🗑️ Deleted ${resFee.deletedCount} items from Fee model.`);
    console.log("✨ Fee model is now clean!");

    let order = 1;
    for (const amount of feeAmounts) {
      const title = formatINR(amount);
      const slug = `fee-${slugify(title)}`;
      const doc = await Fee.create({
        title,
        slug,
        amount,
        currency: "INR",
        order: order++,
        enabled: true,
      });
      console.log(`✅ Seeded Fee: ${doc.title} (${doc._id})`);
    }

    console.log(`\n🎉 Successfully seeded ${feeAmounts.length} fee tiers into Fee model!`);
  } catch (error) {
    console.error("❌ Error in seedFees:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedFees();

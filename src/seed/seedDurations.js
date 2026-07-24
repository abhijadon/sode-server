"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Duration } = require("../model/Duration");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const durationList = [
  { title: "5 Months", months: 5 },
  { title: "6 Months", months: 6 },
  { title: "6-7 Months", months: 6 },
  { title: "7 Months", months: 7 },
  { title: "8 Months", months: 8 },
  { title: "11 Months", months: 11 },
  { title: "12 Months", months: 12 },
  { title: "18 Months", months: 18 },
  { title: "24 Months", months: 24 },
  { title: "25 Months", months: 25 },
  { title: "26 Months", months: 26 },
  { title: "27 Months", months: 27 },
  { title: "30 Months", months: 30 },
  { title: "36 Months", months: 36 },
];

async function seedDurations() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing old Duration collection...");
    try {
      await mongoose.connection.db.collection("durations").dropIndexes();
    } catch (e) {}

    const resDuration = await Duration.deleteMany({});
    console.log(`🗑️ Deleted ${resDuration.deletedCount} items from Duration model.`);
    console.log("✨ Duration model is now clean!");

    let order = 1;
    for (const item of durationList) {
      const slug = slugify(item.title);
      const doc = await Duration.create({
        title: item.title,
        slug: slug,
        months: item.months,
        order: order++,
        enabled: true,
      });
      console.log(`✅ Seeded Duration: "${doc.title}" (${doc._id})`);
    }

    console.log(`\n🎉 Successfully seeded ${durationList.length} durations into Duration model!`);
  } catch (error) {
    console.error("❌ Error in seedDurations:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedDurations();

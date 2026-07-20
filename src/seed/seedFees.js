"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Fee } = require("../model/Fee");
const { Course } = require("../model/Course");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const feeTiers = [
  { title: "Free / Funded", amount: 0, currency: "INR", order: 1 },
  { title: "₹50,000", amount: 50000, currency: "INR", order: 2 },
  { title: "₹1,00,000", amount: 100000, currency: "INR", order: 3 },
  { title: "₹1,50,000", amount: 150000, currency: "INR", order: 4 },
  { title: "₹2,00,000", amount: 200000, currency: "INR", order: 5 },
  { title: "₹2,50,000", amount: 250000, currency: "INR", order: 6 },
  { title: "₹3,00,000", amount: 300000, currency: "INR", order: 7 },
  { title: "$2,500", amount: 2500, currency: "USD", order: 8 },
  { title: "$5,000", amount: 5000, currency: "USD", order: 9 },
];

async function seedFeesAndSyncCourses() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔄 Seeding Fee tiers...");
    const feeDocs = [];
    for (const item of feeTiers) {
      const slug = slugify(item.title);
      const doc = await Fee.findOneAndUpdate(
        { slug },
        {
          $set: {
            title: item.title,
            slug,
            amount: item.amount,
            currency: item.currency,
            order: item.order,
            enabled: true,
          },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      feeDocs.push(doc);
      console.log(`✅ Synced Fee: ${doc.title} (${doc._id})`);
    }

    const defaultFee = feeDocs[0]; // Free / Funded

    console.log("🔄 Updating courses to reference dynamic Fee ObjectIds...");
    const courses = await Course.find({});
    for (const course of courses) {
      if (!course.fee || typeof course.fee === "number") {
        await Course.updateOne(
          { _id: course._id },
          { $set: { fee: defaultFee._id } }
        );
        console.log(`✅ Associated Course "${course.title}" with Fee: ${defaultFee.title}`);
      }
    }

    console.log("\n🎉 All Fee tiers and course associations completed!");
  } catch (error) {
    console.error("❌ Error seeding fees:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedFeesAndSyncCourses();

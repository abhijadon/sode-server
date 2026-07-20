"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Eligibility } = require("../model/Eligibility");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function migrateEligibilitiesToObjectId() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // Fetch raw course collection documents directly
    const rawCourses = await mongoose.connection.db
      .collection("courses")
      .find({})
      .toArray();

    console.log(`📌 Found ${rawCourses.length} course documents. Processing eligibility migration...`);

    const eligibilityMap = new Map();
    let orderCounter = 1;

    let updatedCount = 0;
    for (const rawCourse of rawCourses) {
      let matchedEligibilityObj = null;

      // If eligibility is already an ObjectId pointing to Eligibility collection
      if (rawCourse.eligibility && mongoose.Types.ObjectId.isValid(rawCourse.eligibility)) {
        const existingElg = await Eligibility.findById(rawCourse.eligibility);
        if (existingElg) {
          matchedEligibilityObj = existingElg;
        }
      }

      // If eligibility is a string (e.g. "Masters Degree", "Bachelors Degree", etc.)
      if (!matchedEligibilityObj && typeof rawCourse.eligibility === "string" && rawCourse.eligibility.trim()) {
        const rawStr = rawCourse.eligibility.trim();
        const slug = slugify(rawStr);

        let doc = await Eligibility.findOne({ slug });
        if (!doc) {
          doc = await Eligibility.findOne({ title: new RegExp(`^${rawStr}$`, "i") });
        }

        if (!doc) {
          doc = await Eligibility.create({
            title: rawStr,
            slug,
            enabled: true,
            order: orderCounter++,
          });
          console.log(`✨ Created New Eligibility: "${rawStr}" (${slug})`);
        }

        matchedEligibilityObj = doc;
      }

      // Default fallback if missing
      if (!matchedEligibilityObj) {
        let fallbackDoc = await Eligibility.findOne({ slug: "bachelors-degree" });
        if (!fallbackDoc) {
          fallbackDoc = await Eligibility.create({
            title: "Bachelor's Degree",
            slug: "bachelors-degree",
            enabled: true,
            order: 1,
          });
        }
        matchedEligibilityObj = fallbackDoc;
      }

      if (matchedEligibilityObj) {
        await mongoose.connection.db.collection("courses").updateOne(
          { _id: rawCourse._id },
          { $set: { eligibility: matchedEligibilityObj._id } }
        );
        updatedCount++;
        console.log(`✅ Course "${rawCourse.title}" -> Eligibility: "${matchedEligibilityObj.title}" (${matchedEligibilityObj._id})`);
      }
    }

    console.log(`🎉 Successfully converted ${updatedCount}/${rawCourses.length} Courses eligibility to ObjectId!`);
  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

migrateEligibilitiesToObjectId();

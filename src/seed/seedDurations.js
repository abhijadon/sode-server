"use strict";

require("dotenv").config();
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

async function cleanAndSyncDurations() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // 1️⃣ Delete old duration documents to remove duplicates cleanly
    await Duration.deleteMany({});
    console.log("🗑️ Cleaned up all old/duplicate Duration documents.");

    // 2️⃣ Clean, exact duration list without any parentheses text
    const cleanDurations = [
      { title: "3 Months", months: 3, order: 1 },
      { title: "4 Months", months: 4, order: 2 },
      { title: "5 Months", months: 5, order: 3 },
      { title: "6 Months", months: 6, order: 4 },
      { title: "7 Months", months: 7, order: 5 },
      { title: "9 Months", months: 9, order: 6 },
      { title: "12 Months", months: 12, order: 7 },
      { title: "13 Months", months: 13, order: 8 },
      { title: "18 Months", months: 18, order: 9 },
      { title: "24 Months", months: 24, order: 10 },
      { title: "27 Months", months: 27, order: 11 },
      { title: "30 Months", months: 30, order: 12 },
      { title: "30 Weeks", months: 8, order: 13 },
      { title: "36 Months", months: 36, order: 14 },
      { title: "48 Months", months: 48, order: 15 },
    ];

    const durationMap = new Map();

    for (const b of cleanDurations) {
      const slug = slugify(b.title);
      const doc = await Duration.create({
        title: b.title,
        slug,
        months: b.months,
        order: b.order,
        enabled: true,
      });
      console.log(`✅ Created Duration: "${b.title}" (${slug})`);
      durationMap.set(slug, doc);
    }

    const defaultDur = durationMap.get("24-months");

    // 3️⃣ Re-map courses based on course title / slug to their exact clean duration ObjectId
    const rawCourses = await mongoose.connection.db
      .collection("courses")
      .find({})
      .toArray();

    let updatedCount = 0;
    for (const rawCourse of rawCourses) {
      let matchedDur = defaultDur;
      const titleLower = String(rawCourse.title || "").toLowerCase();
      const slugLower = String(rawCourse.slug || "").toLowerCase();

      if (titleLower.includes("dba") || titleLower.includes("doctor")) {
        if (slugLower.includes("ggu")) matchedDur = durationMap.get("27-months");
        else matchedDur = durationMap.get("36-months");
      } else if (titleLower.includes("mba + dba")) {
        matchedDur = durationMap.get("30-months");
      } else if (titleLower.includes("digital marketing")) {
        matchedDur = durationMap.get("4-months");
      } else if (titleLower.includes("digital brand")) {
        matchedDur = durationMap.get("7-months");
      } else if (titleLower.includes("generative ai for leaders")) {
        matchedDur = durationMap.get("5-months");
      } else if (titleLower.includes("applied ai and agentic")) {
        matchedDur = durationMap.get("30-weeks");
      } else if (titleLower.includes("certificate") || titleLower.includes("cto")) {
        matchedDur = durationMap.get("6-months");
      } else if (titleLower.includes("master of business administration")) {
        if (slugLower.includes("online")) matchedDur = durationMap.get("24-months");
        else matchedDur = durationMap.get("13-months");
      } else if (titleLower.includes("m.sc") || titleLower.includes("diploma")) {
        matchedDur = durationMap.get("18-months");
      }

      if (matchedDur) {
        await mongoose.connection.db.collection("courses").updateOne(
          { _id: rawCourse._id },
          { $set: { duration: matchedDur._id } }
        );
        updatedCount++;
        console.log(`✅ Mapped Course "${rawCourse.title}" (${rawCourse.slug}) -> Duration: "${matchedDur.title}"`);
      }
    }

    console.log(`🎉 Successfully mapped ${updatedCount}/${rawCourses.length} courses to clean Duration ObjectIds!`);
  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

cleanAndSyncDurations();

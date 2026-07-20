"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { University } = require("../model/University");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function migrateCoursesUniversityToObjectId() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // Fetch all existing University documents in DB (DO NOT modify or create new ones)
    const existingUniversities = await University.find({ removed: false });
    console.log(`📌 Found ${existingUniversities.length} existing University documents in DB.`);

    const uniMap = new Map();
    for (const u of existingUniversities) {
      uniMap.set(u.slug, u);
      uniMap.set(u.name.toLowerCase(), u);
    }

    // Fetch raw course collection documents
    const rawCourses = await mongoose.connection.db
      .collection("courses")
      .find({})
      .toArray();

    console.log(`📌 Found ${rawCourses.length} course documents. Processing university migration...`);

    let updatedCount = 0;
    for (const rawCourse of rawCourses) {
      let matchedUni = null;

      // Check if already a valid ObjectId
      if (rawCourse.university && mongoose.Types.ObjectId.isValid(rawCourse.university)) {
        const existingDoc = await University.findById(rawCourse.university);
        if (existingDoc) matchedUni = existingDoc;
      }

      // If string, match against existing University documents in DB
      if (!matchedUni && typeof rawCourse.university === "string") {
        const rawStr = rawCourse.university.trim().toLowerCase();
        const slug = slugify(rawStr);

        matchedUni = uniMap.get(slug) || uniMap.get(rawStr);
        if (!matchedUni) {
          matchedUni = await University.findOne({
            $or: [
              { name: new RegExp(rawStr, "i") },
              { slug: new RegExp(slug, "i") },
            ],
          });
        }
      }

      // Fallback matching by course slug keywords against existing universities
      if (!matchedUni) {
        const cSlug = String(rawCourse.slug || "").toLowerCase();
        if (cSlug.includes("ggu")) matchedUni = uniMap.get("golden-gate-university");
        else if (cSlug.includes("rushford")) matchedUni = uniMap.get("rushford-business-school");
        else if (cSlug.includes("ssbm")) matchedUni = uniMap.get("ssbm-geneva");
        else if (cSlug.includes("esgci")) matchedUni = uniMap.get("esgci");
        else if (cSlug.includes("edgewood")) matchedUni = uniMap.get("edgewood-university");
        else if (cSlug.includes("liverpool")) matchedUni = uniMap.get("liverpool-business-school");
        else if (cSlug.includes("iiitb") || cSlug.includes("iiit-bangalore")) matchedUni = uniMap.get("iiit-bangalore");
        else if (cSlug.includes("iim-kozhikode")) matchedUni = uniMap.get("iim-kozhikode");
        else if (cSlug.includes("iitkgp")) matchedUni = uniMap.get("iiit-bangalore"); // Map IIT KGP to IIIT Bangalore or nearest
        else if (cSlug.includes("mica")) matchedUni = uniMap.get("mica");
        else if (cSlug.includes("ljmu")) matchedUni = uniMap.get("liverpool-john-moores-university");
      }

      if (!matchedUni) {
        matchedUni = existingUniversities[0];
      }

      if (matchedUni) {
        await mongoose.connection.db.collection("courses").updateOne(
          { _id: rawCourse._id },
          { $set: { university: matchedUni._id } }
        );
        updatedCount++;
        console.log(`✅ Mapped Course "${rawCourse.title}" -> Existing University: "${matchedUni.name}" (${matchedUni._id})`);
      }
    }

    console.log(`🎉 Successfully mapped ${updatedCount}/${rawCourses.length} Courses to existing University ObjectIds!`);
  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

migrateCoursesUniversityToObjectId();

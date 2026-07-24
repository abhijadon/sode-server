"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Course } = require("../model/Course");
const { University } = require("../model/University");
const { PartnerCourse } = require("../model/PartnerCourse");
const { PartnerUniversity } = require("../model/PartnerUniversity");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function clearCategoryReferences() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 Connected to MongoDB.");

    console.log("🧹 Clearing category ObjectId references from Course, University, PartnerCourse, and PartnerUniversity...");

    // 1️⃣ Clear category/categories from Course
    const resCourses = await Course.updateMany(
      {},
      { $unset: { category: "", categories: "" } }
    );
    console.log(` ✅ Courses updated: ${resCourses.modifiedCount || resCourses.nModified || 0} documents cleared.`);

    // 2️⃣ Clear category/categories from University
    const resUniversities = await University.updateMany(
      {},
      { $unset: { category: "", categories: "" } }
    );
    console.log(` ✅ Universities updated: ${resUniversities.modifiedCount || resUniversities.nModified || 0} documents cleared.`);

    // 3️⃣ Clear category/categories from PartnerCourse
    const resPartnerCourses = await PartnerCourse.updateMany(
      {},
      { $unset: { category: "", categories: "" } }
    );
    console.log(` ✅ PartnerCourses updated: ${resPartnerCourses.modifiedCount || resPartnerCourses.nModified || 0} documents cleared.`);

    // 4️⃣ Clear category/categories from PartnerUniversity
    const resPartnerUniversities = await PartnerUniversity.updateMany(
      {},
      { $unset: { category: "", categories: "" } }
    );
    console.log(` ✅ PartnerUniversities updated: ${resPartnerUniversities.modifiedCount || resPartnerUniversities.nModified || 0} documents cleared.`);

    console.log("\n🎉 Successfully cleared category ObjectIds from all target collections in MongoDB.");
  } catch (err) {
    console.error("❌ Error clearing category references:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

clearCategoryReferences();

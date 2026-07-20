"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Category } = require("../model/Category");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

async function seedCleanCategories() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    // 1️⃣ Delete all existing categories to remove any duplicates
    await Category.deleteMany({});
    console.log("🗑️ Cleaned up all old/duplicate categories.");

    // 2️⃣ Exact 7 Unique Categories
    const categoriesList = [
      { name: "Doctorate", slug: "doctorate", type: "course", order: 1 },
      { name: "Certifications", slug: "certification", type: "course", order: 2 },
      { name: "Executive Programs", slug: "executive", type: "course", order: 3 },
      { name: "Master", slug: "master", type: "course", order: 4 },
      { name: "Banking", slug: "banking", type: "general", order: 5 },
      { name: "Finance", slug: "finance", type: "general", order: 6 },
      { name: "Leadership", slug: "leadership", type: "general", order: 7 },
    ];

    const categoryMap = new Map();

    for (const cat of categoriesList) {
      const doc = await Category.create({
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
        enabled: true,
        order: cat.order,
      });
      categoryMap.set(cat.slug, doc);
      console.log(`✅ Created Category: "${cat.name}" (${cat.slug}) [Order: ${cat.order}]`);
    }

    const masterCat = categoryMap.get("master");

    // 3️⃣ Re-map all 20 courses to one of the 4 course-level Category ObjectIds
    const rawCourses = await mongoose.connection.db
      .collection("courses")
      .find({})
      .toArray();

    let updatedCount = 0;
    for (const rawCourse of rawCourses) {
      let targetCat = masterCat;
      const titleLower = String(rawCourse.title || "").toLowerCase();

      if (titleLower.includes("doctor") || titleLower.includes("dba") || titleLower.includes("phd")) {
        targetCat = categoryMap.get("doctorate");
      } else if (titleLower.includes("executive") || titleLower.includes("cto") || titleLower.includes("leadership")) {
        targetCat = categoryMap.get("executive");
      } else if (titleLower.includes("certificate") || titleLower.includes("certification") || titleLower.includes("brand")) {
        targetCat = categoryMap.get("certification");
      } else if (titleLower.includes("master") || titleLower.includes("mba") || titleLower.includes("m.sc")) {
        targetCat = categoryMap.get("master");
      }

      await mongoose.connection.db.collection("courses").updateOne(
        { _id: rawCourse._id },
        {
          $set: { category: targetCat._id },
          $unset: { categoryId: "" },
        }
      );
      updatedCount++;
    }

    console.log(`🎉 Done! ${updatedCount} courses mapped cleanly.`);
  } catch (error) {
    console.error("❌ Error in category seed script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedCleanCategories();

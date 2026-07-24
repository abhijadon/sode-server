"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Subcourse } = require("../model/Subcourse");
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

const rawInputLines = [
  "DBA - General",
  "DBA - Finance",
  "DBA - Leadership",
  "MBA + DBA - Finance",
  "MBA + DBA - Leadership",
  "Online DBA (Doctor of Business Administration)",
  "DBA - General",
  "DBA - International Business",
  "DBA - Healthcare Management",
  "DBA - Human Resource Management",
  "DBA - Supply Chain Management",
  "DBA - Finance",
  "DBA - Data Science",
  "DBA - Marketing",
  "DBA - Business Analytics",
  "DBA - Finance",
  "DBA - Marketing",
  "DBA - Leadership",
  "DBA - General",
  "DBA - Business Analytics",
  "DBA - Generative AI",
  "MBA - Business Analytics Concentration",
  "MBA - Industrial Organizational Psychology Concentration",
  "MBA - Information Technology Management",
  "MBA - Finance",
  "MBA - Marketing",
  "MBA - Adaptive Leadership",
  "MBA - General",
  "DBA - Global and International Management",
  "DBA - Cybersecurity Management",
  "DBA - Human Resources Management",
  "DBA - Tax Management",
  "DBA - Finance and Banking",
  "DBA - Marketing",
  "DBA - Operations Management",
  "DBA - Strategic Management",
  "DBA - Entrepreneurship",
  "DBA - IT Management",
  "DBA - Energy Management",
  "DBA - Health Care Management",
  "DBA - Data Science",
  "DBA - Machine Learning",
  "DBA - Finance",
  "DBA - International Business Leadership",
  "DBA - Global Supply Chain Management",
  "DBA - Accounting",
  "DBA - AML Compliance",
  "MBA - Business Analytics",
  "MBA - Finance",
  "MBA - Marketing",
  "MBA - Leadership",
  "MBA - Human Resource Management",
  "MBA - Operations and Supply Chain Management",
  "MBA - Strategic Leadership",
  "MBA - AI and Technology",
  "MBA - Finance",
  "MBA - Marketing",
  "MBA - Operations and Supply Chain",
];

function parseLine(rawLine) {
  const line = rawLine.trim();
  if (line.includes("-")) {
    const parts = line.split("-");
    const parentPart = parts[0].trim();
    const subPart = parts.slice(1).join("-").trim();

    let parentSlug = "dba";
    if (parentPart === "MBA + DBA") parentSlug = "mba-dba";
    else if (parentPart === "MBA") parentSlug = "mba";
    else if (parentPart === "DBA") parentSlug = "dba";

    return { parentSlug, subTitle: subPart };
  }

  return { parentSlug: "dba", subTitle: line };
}

async function seedSubcourses() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing old Subcourse collection...");
    try {
      await mongoose.connection.db.collection("subcourses").dropIndexes();
    } catch (e) {}

    const resSub = await Subcourse.deleteMany({});
    console.log(`🗑️ Deleted ${resSub.deletedCount} items from Subcourse model.`);
    console.log("✨ Subcourse model is clean!");

    const courses = await Course.find({});
    console.log(`📊 Found ${courses.length} Parent Courses in DB.`);

    const courseMap = new Map();
    courses.forEach((c) => courseMap.set(c.slug, c._id));
    const defaultCourseId = courses[0]?._id;

    // Aggregate subcourses by subTitle -> Set of parentSlugs
    const aggregatedSubcourses = new Map();

    for (const rawLine of rawInputLines) {
      const { parentSlug, subTitle } = parseLine(rawLine);
      const titleKey = subTitle.trim();

      if (!aggregatedSubcourses.has(titleKey)) {
        aggregatedSubcourses.set(titleKey, new Set());
      }
      aggregatedSubcourses.get(titleKey).add(parentSlug);
    }

    let order = 1;
    for (const [subTitle, parentSlugsSet] of aggregatedSubcourses.entries()) {
      const parentSlugs = Array.from(parentSlugsSet);
      const parentObjectIds = parentSlugs
        .map((slug) => courseMap.get(slug))
        .filter(Boolean);

      const primaryParentId = parentObjectIds[0] || defaultCourseId;
      const slug = slugify(subTitle);

      const subDoc = await Subcourse.create({
        title: subTitle,
        slug: slug,
        course: primaryParentId,
        courses: parentObjectIds,
        order: order++,
        enabled: true,
      });

      console.log(
        `✅ Seeded Subcourse: "${subDoc.title}" (${subDoc.slug}) | Primary: ${parentSlugs[0]} | All Parents: [${parentSlugs.join(", ")}] (${subDoc._id})`
      );
    }

    console.log(
      `\n🎉 Successfully seeded ${aggregatedSubcourses.size} clean subcourses with parent course associations!`
    );
  } catch (error) {
    console.error("❌ Error in seedSubcourses:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedSubcourses();

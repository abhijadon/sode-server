"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { PartnerCourse } = require("../model/PartnerCourse");
const { University } = require("../model/University");
const { Course } = require("../model/Course");
const { Subcourse } = require("../model/Subcourse");
const { Category } = require("../model/Category");
const { Fee } = require("../model/Fee");
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

const master75Rows = [
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", courseTitle: "DBA - General", domainCat: "Management", feeAmount: 950000, durationStr: "24 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", courseTitle: "DBA - Finance", domainCat: "Finance", feeAmount: 950001, durationStr: "25 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Doctorate", courseTitle: "DBA - Leadership", domainCat: "Leadership", feeAmount: 950002, durationStr: "26 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Master + Doctorate (Dual)", courseTitle: "MBA + DBA - Finance", domainCat: "Finance", feeAmount: 1170000, durationStr: "30 months" },
  { rootCat: "Global Universities", uniName: "Edgewood University", degreeLevel: "Master + Doctorate (Dual)", courseTitle: "MBA + DBA - Leadership", domainCat: "Leadership", feeAmount: 1170000, durationStr: "30 months" },
  { rootCat: "Global Universities", uniName: "ESGCI", degreeLevel: "Doctorate", courseTitle: "Online DBA (Doctor of Business Administration)", domainCat: "Management", feeAmount: 715000, durationStr: "24 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - General", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - International Business", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Healthcare Management", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Human Resource Management", domainCat: "HR", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Supply Chain Management", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Finance", domainCat: "Finance", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Data Science", domainCat: "Data Science", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Marketing", domainCat: "Management", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Rushford Business School", degreeLevel: "Doctorate", courseTitle: "DBA - Business Analytics", domainCat: "Data Science", feeAmount: 650000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "DBA - Finance", domainCat: "Finance", feeAmount: 1065000, durationStr: "27 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "DBA - Marketing", domainCat: "Management", feeAmount: 1065000, durationStr: "27 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "DBA - Leadership", domainCat: "Leadership", feeAmount: 1065000, durationStr: "27 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "DBA - General", domainCat: "Management", feeAmount: 1065000, durationStr: "27 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "DBA - Business Analytics", domainCat: "Data Science", feeAmount: 1065000, durationStr: "27 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Doctorate", courseTitle: "DBA - Generative AI", domainCat: "AI Courses", feeAmount: 1065000, durationStr: "27 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - Business Analytics Concentration", domainCat: "Data Science", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - Industrial Organizational Psychology Concentration", domainCat: "HR", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - Information Technology Management", domainCat: "Management", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - Finance", domainCat: "Finance", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - Marketing", domainCat: "Management", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - Adaptive Leadership", domainCat: "Leadership", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Golden Gate University", degreeLevel: "Master", courseTitle: "MBA - General", domainCat: "Management", feeAmount: 1200000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Global and International Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Cybersecurity Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Human Resources Management", domainCat: "HR", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Tax Management", domainCat: "Finance", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Finance and Banking", domainCat: "Banking", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Marketing", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Operations Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Strategic Management", domainCat: "Leadership", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Entrepreneurship", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - IT Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Energy Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Health Care Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Data Science", domainCat: "Data Science", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Machine Learning", domainCat: "Machine Learning", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Finance", domainCat: "Finance", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - International Business Leadership", domainCat: "Leadership", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Global Supply Chain Management", domainCat: "Management", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - Accounting", domainCat: "Finance", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "SSBM Geneva", degreeLevel: "Doctorate", courseTitle: "DBA - AML Compliance", domainCat: "Finance", feeAmount: 750000, durationStr: "36 months" },
  { rootCat: "Global Universities", uniName: "Liverpool Business School", degreeLevel: "Master", courseTitle: "MBA - Business Analytics", domainCat: "Data Science", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Liverpool Business School", degreeLevel: "Master", courseTitle: "MBA - Finance", domainCat: "Finance", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Liverpool Business School", degreeLevel: "Master", courseTitle: "MBA - Marketing", domainCat: "Management", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Liverpool Business School", degreeLevel: "Master", courseTitle: "MBA - Leadership", domainCat: "Leadership", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Liverpool Business School", degreeLevel: "Master", courseTitle: "MBA - Human Resource Management", domainCat: "HR", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Liverpool Business School", degreeLevel: "Master", courseTitle: "MBA - Operations and Supply Chain Management", domainCat: "Management", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Paris School of Business", degreeLevel: "Master", courseTitle: "MBA - Strategic Leadership", domainCat: "Leadership", feeAmount: 680000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Paris School of Business", degreeLevel: "Master", courseTitle: "MBA - AI and Technology", domainCat: "AI Courses", feeAmount: 680000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Paris School of Business", degreeLevel: "Master", courseTitle: "MBA - Finance", domainCat: "Finance", feeAmount: 680000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Paris School of Business", degreeLevel: "Master", courseTitle: "MBA - Marketing", domainCat: "Management", feeAmount: 680000, durationStr: "18 months" },
  { rootCat: "Global Universities", uniName: "Paris School of Business", degreeLevel: "Master", courseTitle: "MBA - Operations and Supply Chain", domainCat: "Management", feeAmount: 680000, durationStr: "18 months" },
  { rootCat: "IIT", uniName: "IIT Roorkee", degreeLevel: "Certification", courseTitle: "PG Certificate in Data Science, Machine Learning & Generative AI", domainCat: "Data Science", feeAmount: 175000, durationStr: "8 months" },
  { rootCat: "IIT", uniName: "IIT Delhi", degreeLevel: "Certification", courseTitle: "Executive Programme in Advanced Project Management", domainCat: "Management", feeAmount: 129800, durationStr: "6 months" },
  { rootCat: "IIT", uniName: "IIT Madras", degreeLevel: "Certification", courseTitle: "Advanced Certificate in Applied Artificial Intelligence & Deep Learning", domainCat: "Machine Learning", feeAmount: 194700, durationStr: "7 months" },
  { rootCat: "IIM", uniName: "IIM Kozhikode", degreeLevel: "Certification", courseTitle: "Certificate Programme in Strategic AI for Business Professionals", domainCat: "AI Courses", feeAmount: 199000, durationStr: "6 months" },
  { rootCat: "IIM", uniName: "IIM Bangalore", degreeLevel: "Certification", courseTitle: "Young Leaders Programme in General Management", domainCat: "Management", feeAmount: 292640, durationStr: "11 months" },
  { rootCat: "IIM", uniName: "IIM Udaipur", degreeLevel: "Master", courseTitle: "MBA", domainCat: "Management", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "IIM", uniName: "IIM Lucknow", degreeLevel: "Master", courseTitle: "MBA", domainCat: "Management", feeAmount: 510000, durationStr: "18 months" },
  { rootCat: "IIM", uniName: "IIM Nagpur", degreeLevel: "Certification", courseTitle: "Post Graduate Certificate Programme in Advanced HR Analytics", domainCat: "HR", feeAmount: 160000, durationStr: "7 months" },
  { rootCat: "IIM", uniName: "IIM Indore", degreeLevel: "Certification", courseTitle: "Executive Programme in Sales and Marketing (EPSM)", domainCat: "Management", feeAmount: 200000, durationStr: "12 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", courseTitle: "Executive Programme in Generative AI for Leaders", domainCat: "AI Courses", feeAmount: 225000, durationStr: "5 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", courseTitle: "Executive Post Graduate Certificate Programme in Data Science & AI", domainCat: "Data Science", feeAmount: 180000, durationStr: "6 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", courseTitle: "Professional Certificate Programme in Data Science with Agentic AI", domainCat: "Data Science", feeAmount: 99000, durationStr: "6 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", courseTitle: "Executive Post Graduate Programme in Applied AI and Agentic AI", domainCat: "AI Courses", feeAmount: 140000, durationStr: "7 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Diploma", courseTitle: "Executive Diploma in Machine Learning & Artificial Intelligence", domainCat: "Machine Learning", feeAmount: 310000, durationStr: "12 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Certification", courseTitle: "Chief Technology Officer & AI Leadership Programme", domainCat: "Leadership", feeAmount: 365000, durationStr: "6 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Master", courseTitle: "Master of Science in Machine Learning & Artificial Intelligence", domainCat: "Machine Learning", feeAmount: 535000, durationStr: "18 months" },
  { rootCat: "Other", uniName: "IIIT Bangalore", degreeLevel: "Master", courseTitle: "Master of Science in Data Science", domainCat: "Data Science", feeAmount: 485000, durationStr: "18 months" },
  { rootCat: "Other", uniName: "XLRI Jamshedpur", degreeLevel: "Certification", courseTitle: "Executive Development Programme in Human Resource Management", domainCat: "HR", feeAmount: 180000, durationStr: "6-7 months" },
];

function extractSubcourseTitle(fullTitle) {
  const line = fullTitle.trim();
  if (line.includes("-")) {
    const parts = line.split("-");
    return parts.slice(1).join("-").trim();
  }
  return line;
}

function extractParentCourseSlug(fullTitle) {
  const t = fullTitle.trim();
  if (t.startsWith("MBA + DBA")) return "mba-dba";
  if (t.startsWith("MBA")) return "mba";
  if (t.startsWith("DBA") || t.includes("DBA")) return "dba";
  if (t.includes("Data Science") || t.includes("Machine Learning") || t.includes("AI")) return "pg-certificate-data-science-ml-genai";
  if (t.includes("Project Management")) return "executive-programme-advanced-project-management";
  if (t.includes("Sales and Marketing")) return "executive-programme-sales-marketing-epsm";
  if (t.includes("Human Resource")) return "executive-development-programme-hr-management";
  return "mba";
}

async function seedPartnerCoursesMaster() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing old PartnerCourse collection...");
    try {
      await mongoose.connection.db.collection("partnercourses").dropIndexes();
    } catch (e) { }

    const resPartner = await PartnerCourse.deleteMany({});
    console.log(`🗑️ Deleted ${resPartner.deletedCount} items from PartnerCourse model.`);
    console.log("✨ PartnerCourse model is now clean!");

    // Fetch lookups
    const universities = await University.find({});
    const courses = await Course.find({});
    const subcourses = await Subcourse.find({});
    const categories = await Category.find({});
    const fees = await Fee.find({});
    const durations = await Duration.find({});

    console.log(`📊 Lookups: ${universities.length} Unis, ${courses.length} Courses, ${subcourses.length} Subcourses, ${categories.length} Cats, ${fees.length} Fees, ${durations.length} Durations.`);

    const uniMap = new Map();
    universities.forEach((u) => uniMap.set(u.slug, u._id));

    const courseMap = new Map();
    courses.forEach((c) => courseMap.set(c.slug, c._id));

    const subcourseMap = new Map();
    subcourses.forEach((s) => subcourseMap.set(s.slug, s._id));

    const catMap = new Map();
    categories.forEach((c) => catMap.set(c.slug, c._id));

    const feeMap = new Map();
    fees.forEach((f) => feeMap.set(f.amount, f._id));

    const durationMap = new Map();
    durations.forEach((d) => durationMap.set(d.slug, d._id));

    let order = 1;
    for (const row of master75Rows) {
      // 1. University
      const uniSlug = slugify(row.uniName);
      const uniId = uniMap.get(uniSlug) || null;

      // 2. Course
      const parentCourseSlug = extractParentCourseSlug(row.courseTitle);
      const courseId = courseMap.get(parentCourseSlug) || courses[0]?._id;

      // 3. Subcourse
      const subTitle = extractSubcourseTitle(row.courseTitle);
      const subSlug = slugify(subTitle);
      const subcourseId = subcourseMap.get(subSlug) || null;

      // 4. Categories (Degree level + Domain + Root Category)
      const degreeSlug = slugify(row.degreeLevel);
      const degreeCatId = catMap.get(degreeSlug) || null;

      const domainSlug = slugify(row.domainCat);
      let domainCatId = catMap.get(domainSlug) || catMap.get(`browse-${domainSlug}`) || null;

      const rootSlug = slugify(row.rootCat);
      const rootCatId = catMap.get(rootSlug) || null;

      const categoryIds = [degreeCatId, domainCatId, rootCatId].filter(Boolean);

      // 5. Fee
      const feeId = feeMap.get(row.feeAmount) || null;

      // 6. Duration
      const durSlug = slugify(row.durationStr);
      const durationId = durationMap.get(durSlug) || null;

      const slug = `${slugify(row.uniName)}-${slugify(row.courseTitle)}-${order}`;

      const partnerDoc = await PartnerCourse.create({
        title: `${row.uniName} - ${row.courseTitle}`,
        slug: slug,
        university: uniId,
        course: courseId,
        subcourse: subcourseId,
        category: degreeCatId || domainCatId || categoryIds[0] || null,
        categories: categoryIds,
        fee: feeId,
        duration: durationId,
        order: order++,
        featured: true,
        enabled: true,
      });

      console.log(`✅ Seeded PartnerCourse #${order - 1}: "${partnerDoc.title}" | Uni: ${row.uniName} | Fee: ₹${row.feeAmount.toLocaleString("en-IN")} | Dur: ${row.durationStr}`);
    }

    console.log(`\n🎉 Successfully seeded ALL ${master75Rows.length} master course offerings into PartnerCourse collection!`);
  } catch (error) {
    console.error("❌ Error in seedPartnerCoursesMaster:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedPartnerCoursesMaster();

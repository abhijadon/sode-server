"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { Course } = require("../model/Course");
const { Category } = require("../model/Category");
const { Fee } = require("../model/Fee");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

// 📦 Exactly the 19 core courses with their respective Root Category slugs (Doctorate, Master, Certification, Diploma) and Fee amounts
const base19Courses = [
  {
    title: "DBA (Doctor of Business Administration)",
    slug: "dba",
    catSlug: "doctorate",
    feeAmount: 950000,
    featured: true,
    order: 1,
  },
  {
    title: "MBA + DBA (Dual Degree)",
    slug: "mba-dba",
    catSlug: "doctorate",
    feeAmount: 1170000,
    featured: true,
    order: 2,
  },
  {
    title: "MBA (Master of Business Administration)",
    slug: "mba",
    catSlug: "master",
    feeAmount: 510000,
    featured: true,
    order: 3,
  },
  {
    title: "PG Certificate in Data Science, Machine Learning & Generative AI",
    slug: "pg-certificate-data-science-ml-genai",
    catSlug: "certification",
    feeAmount: 175000,
    featured: true,
    order: 4,
  },
  {
    title: "Executive Programme in Advanced Project Management",
    slug: "executive-programme-advanced-project-management",
    catSlug: "certification",
    feeAmount: 129800,
    featured: false,
    order: 5,
  },
  {
    title: "Advanced Certificate in Applied Artificial Intelligence & Deep Learning",
    slug: "advanced-certificate-applied-ai-deep-learning",
    catSlug: "certification",
    feeAmount: 194700,
    featured: false,
    order: 6,
  },
  {
    title: "Certificate Programme in Strategic AI for Business Professionals",
    slug: "certificate-programme-strategic-ai-business",
    catSlug: "certification",
    feeAmount: 199000,
    featured: false,
    order: 7,
  },
  {
    title: "Young Leaders Programme in General Management",
    slug: "young-leaders-programme-general-management",
    catSlug: "certification",
    feeAmount: 292640,
    featured: false,
    order: 8,
  },
  {
    title: "Post Graduate Certificate Programme in Advanced HR Analytics",
    slug: "post-graduate-certificate-advanced-hr-analytics",
    catSlug: "certification",
    feeAmount: 160000,
    featured: false,
    order: 9,
  },
  {
    title: "Executive Programme in Sales and Marketing (EPSM)",
    slug: "executive-programme-sales-marketing-epsm",
    catSlug: "certification",
    feeAmount: 200000,
    featured: false,
    order: 10,
  },
  {
    title: "Executive Programme in Generative AI for Leaders",
    slug: "executive-programme-generative-ai-leaders",
    catSlug: "certification",
    feeAmount: 225000,
    featured: true,
    order: 11,
  },
  {
    title: "Executive Post Graduate Certificate Programme in Data Science & AI",
    slug: "executive-pg-certificate-data-science-ai",
    catSlug: "certification",
    feeAmount: 180000,
    featured: false,
    order: 12,
  },
  {
    title: "Professional Certificate Programme in Data Science with Agentic AI",
    slug: "professional-certificate-data-science-agentic-ai",
    catSlug: "certification",
    feeAmount: 99000,
    featured: true,
    order: 13,
  },
  {
    title: "Executive Post Graduate Programme in Applied AI and Agentic AI",
    slug: "executive-pgp-applied-ai-agentic-ai",
    catSlug: "certification",
    feeAmount: 140000,
    featured: false,
    order: 14,
  },
  {
    title: "Executive Diploma in Machine Learning & Artificial Intelligence",
    slug: "executive-diploma-machine-learning-ai",
    catSlug: "diploma",
    feeAmount: 310000,
    featured: false,
    order: 15,
  },
  {
    title: "Chief Technology Officer & AI Leadership Programme",
    slug: "chief-technology-officer-ai-leadership",
    catSlug: "certification",
    feeAmount: 365000,
    featured: true,
    order: 16,
  },
  {
    title: "Master of Science in Machine Learning & Artificial Intelligence",
    slug: "ms-machine-learning-ai",
    catSlug: "master",
    feeAmount: 535000,
    featured: false,
    order: 17,
  },
  {
    title: "Master of Science in Data Science",
    slug: "ms-data-science",
    catSlug: "master",
    feeAmount: 485000,
    featured: false,
    order: 18,
  },
  {
    title: "Executive Development Programme in Human Resource Management",
    slug: "executive-development-programme-hr-management",
    catSlug: "certification",
    feeAmount: 180000,
    featured: false,
    order: 19,
  },
];

async function seed19CoursesWithCategoryAndFee() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing old Course collection...");
    try {
      await mongoose.connection.db.collection("courses").dropIndexes();
    } catch (e) {}

    const resCourse = await Course.deleteMany({});
    console.log(`🗑️ Deleted ${resCourse.deletedCount} items from Course model.`);

    const categories = await Category.find({});
    const fees = await Fee.find({});

    console.log(`📊 Found ${categories.length} Categories and ${fees.length} Fees in DB.`);

    const feeMap = new Map();
    fees.forEach((f) => feeMap.set(f.amount, f._id));

    const catMap = new Map();
    categories.forEach((c) => catMap.set(c.slug, c._id));

    for (const item of base19Courses) {
      const feeId = feeMap.get(item.feeAmount) || null;
      const catId = catMap.get(item.catSlug) || categories[0]?._id || null;

      const courseDoc = await Course.create({
        title: item.title,
        slug: item.slug,
        category: catId,
        categories: catId ? [catId] : [],
        fee: feeId,
        featured: item.featured,
        order: item.order,
        enabled: true,
      });

      console.log(`✅ Seeded Course "${courseDoc.title}" (${courseDoc.slug}) | Fee: ₹${item.feeAmount.toLocaleString("en-IN")} | Cat: ${item.catSlug}`);
    }

    console.log(`\n🎉 Successfully seeded EXACTLY ${base19Courses.length} core courses with mapped Root Category & Fee ObjectIds!`);
  } catch (error) {
    console.error("❌ Error in seed19CoursesWithCategoryAndFee:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seed19CoursesWithCategoryAndFee();

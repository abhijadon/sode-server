"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { University } = require("../model/University");
const { PartnerUniversity } = require("../model/PartnerUniversity");
const { Category } = require("../model/Category");
const { Media } = require("../model/Media");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function getFileName(url) {
  if (!url) return "file";
  const parts = url.split("/");
  return parts[parts.length - 1] || "file";
}

async function findOrCreateMedia(url, defaultName = "Media Asset") {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  let media = await Media.findOne({ url: cleanUrl });
  if (!media) {
    const fileName = getFileName(cleanUrl);
    const mimeType = fileName.endsWith(".png")
      ? "image/png"
      : fileName.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    media = await Media.create({
      name: defaultName || fileName,
      alt: defaultName || fileName,
      url: cleanUrl,
      bucket: "public-assets",
      key: `assets/${fileName}`,
      fileName,
      mimeType,
      size: 1024,
      enabled: true,
    });
  }
  return media._id;
}

// 🏛️ Clean list of 18 Universities/Institutes mapped with Category Slugs
const cleanUniversitiesList = [
  { name: "Edgewood University", slug: "edgewood-university", catSlug: "list-of-global-universities", logoSrc: "/assets/images/edgewood-logo.jpg" },
  { name: "ESGCI, Paris", slug: "esgci-paris", catSlug: "list-of-global-universities", logoSrc: "/assets/images/esgci-logo.jpg" },
  { name: "Rushford Business School", slug: "rushford-business-school", catSlug: "list-of-global-universities", logoSrc: "/assets/images/rushford-logo.jpg" },
  { name: "Golden Gate University", slug: "golden-gate-university", catSlug: "list-of-global-universities", logoSrc: "/assets/images/ggu-logo.jpg" },
  { name: "SSBM Geneva", slug: "ssbm-geneva", catSlug: "list-of-global-universities", logoSrc: "/assets/images/ssbm-logo.jpg" },
  { name: "Liverpool Business School", slug: "liverpool-business-school", catSlug: "list-of-global-universities", logoSrc: "/assets/images/liverpool-logo.png" },
  { name: "Paris School of Business", slug: "paris-school-of-business", catSlug: "list-of-global-universities", logoSrc: "/assets/images/esgci-logo.jpg" },
  { name: "IIT Roorkee", slug: "iit-roorkee", catSlug: "list-of-iit", logoSrc: "/assets/images/iiitb-logo.jpg" },
  { name: "IIT Delhi", slug: "iit-delhi", catSlug: "list-of-iit", logoSrc: "/assets/images/iiitb-logo.jpg" },
  { name: "IIT Madras", slug: "iit-madras", catSlug: "list-of-iit", logoSrc: "/assets/images/iiitb-logo.jpg" },
  { name: "IIM Kozhikode", slug: "iim-kozhikode", catSlug: "list-of-iim", logoSrc: "/assets/images/iim-logo.jpg" },
  { name: "IIM Bangalore", slug: "iim-bangalore", catSlug: "list-of-iim", logoSrc: "/assets/images/iim-logo.jpg" },
  { name: "IIM Udaipur", slug: "iim-udaipur", catSlug: "list-of-iim", logoSrc: "/assets/images/iim-logo.jpg" },
  { name: "IIM Lucknow", slug: "iim-lucknow", catSlug: "list-of-iim", logoSrc: "/assets/images/iim-logo.jpg" },
  { name: "IIM Nagpur", slug: "iim-nagpur", catSlug: "list-of-iim", logoSrc: "/assets/images/iim-logo.jpg" },
  { name: "IIM Indore", slug: "iim-indore", catSlug: "list-of-iim", logoSrc: "/assets/images/iim-logo.jpg" },
  { name: "IIIT Bangalore", slug: "iiit-bangalore", catSlug: "other", logoSrc: "/assets/images/iiitb-logo.jpg" },
  { name: "XLRI Jamshedpur", slug: "xlri-jamshedpur", catSlug: "other", logoSrc: "/assets/images/iim-logo.jpg" },
];

async function seedCleanUniversities() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully.");

    console.log("🧹 Clearing old University & PartnerUniversity collections...");
    try {
      await mongoose.connection.db.collection("universities").dropIndexes();
    } catch (e) { }
    try {
      await mongoose.connection.db.collection("partneruniversities").dropIndexes();
    } catch (e) { }

    const resUni = await University.deleteMany({});
    const resPartnerUni = await PartnerUniversity.deleteMany({});

    console.log(`🗑️ Deleted ${resUni.deletedCount} items from University model.`);
    console.log(`🗑️ Deleted ${resPartnerUni.deletedCount} items from PartnerUniversity model.`);
    console.log("✨ University & PartnerUniversity models are clean!");

    const categories = await Category.find({});
    const catMap = new Map();
    categories.forEach((c) => catMap.set(c.slug, c._id));

    let order = 1;
    for (const item of cleanUniversitiesList) {
      const logoMediaId = await findOrCreateMedia(item.logoSrc, `${item.name} Logo`);
      const catId = catMap.get(item.catSlug) || catMap.get(item.catSlug.replace("list-of-", "")) || null;

      const uniDoc = await University.create({
        name: item.name,
        slug: item.slug,
        logoSrc: logoMediaId,
        category: catId,
        categories: catId ? [catId] : [],
        order: order,
        enabled: true,
      });

      await PartnerUniversity.create({
        university: uniDoc._id,
        category: catId,
        categories: catId ? [catId] : [],
        order: order,
        featured: true,
        enabled: true,
      });

      console.log(`✅ Seeded Clean University "${uniDoc.name}" (${uniDoc.slug}) | Cat: ${item.catSlug} -> ID: ${uniDoc._id}`);
      order++;
    }

    console.log(`\n🎉 Successfully seeded ${cleanUniversitiesList.length} clean universities mapped with Category ObjectIds!`);
  } catch (error) {
    console.error("❌ Error in seedCleanUniversities:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedCleanUniversities();

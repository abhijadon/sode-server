"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { PageMeta } = require("../model/PageMeta");

const pageMetaData = [
  {
    pageName: "Home Page",
    pagePath: "/",
    title: "SODE | Certifications & Online Degree Courses from IITs, IIMs | DBA & MBA",
    description:
      "Certifications & Online Degree Courses from top IITs, IIMs & global universities via SODE. Enroll in our MBA, DBA & executive leadership programs.",
    keywords: "SODE, online mba, distance education, dba, iim, iit, executive education",
    canonicalUrl: "https://sode.co.in/",
    ogTitle: "Certifications & Online Degree Courses from IITs, IIMs | DBA MBA – SODE",
    ogDescription:
      "Certifications & Online Degree Courses from top IITs, IIMs & global universities via SODE. Enroll in our MBA, DBA & executive leadership programs.",
    ogImage: "https://sode.co.in/assets/images/sode-homepage-og-card-image.png",
    twitterCard: "summary_large_image",
    enabled: true,
  },
  {
    pageName: "Courses List Page",
    pagePath: "/courses",
    title: "Explore Online & Distance Courses | Distance Education School",
    description:
      "Browse top accredited distance & online MBA, BBA, MCA, BCA, DBA and executive degree programs from leading universities.",
    keywords: "online courses, distance mba, bba online, mca distance, dba degree",
    canonicalUrl: "https://sode.co.in/courses",
    ogTitle: "Explore Online & Distance Courses | Distance Education School",
    ogDescription:
      "Browse top accredited distance & online MBA, BBA, MCA, BCA, DBA and executive degree programs from leading universities.",
    ogImage: "https://sode.co.in/assets/images/sode-homepage-og-card-image.png",
    twitterCard: "summary_large_image",
    enabled: true,
  },
  {
    pageName: "Universities List Page",
    pagePath: "/universities",
    title: "Partner Universities & Business Schools | Distance Education School",
    description:
      "Explore partner accredited UGC-DEB approved and top international universities including Golden Gate, Rushford, SSBM, IIIT Bangalore, IIM Kozhikode.",
    keywords: "partner universities, ugc deb approved, accredited business schools, iiit bangalore, iim kozhikode",
    canonicalUrl: "https://sode.co.in/universities",
    ogTitle: "Partner Universities & Business Schools | Distance Education School",
    ogDescription:
      "Explore partner accredited UGC-DEB approved and top international universities including Golden Gate, Rushford, SSBM, IIIT Bangalore, IIM Kozhikode.",
    ogImage: "https://sode.co.in/assets/images/sode-homepage-og-card-image.png",
    twitterCard: "summary_large_image",
    enabled: true,
  },
];

async function seedPageMeta() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://crmadmin:Abhishek2028@172.105.37.57:27017/sode?authSource=admin";

    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("🔄 Upserting page meta data...");

    for (const item of pageMetaData) {
      await PageMeta.findOneAndUpdate(
        { pagePath: item.pagePath },
        { $set: item },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      console.log(`✅ Upserted PageMeta for: ${item.pagePath}`);
    }

    console.log("\n🎉 All PageMeta items successfully imported into MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding PageMeta:", error);
    process.exit(1);
  }
}

seedPageMeta();

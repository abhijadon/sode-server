"use strict";

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { University } = require("../model/University");
const { Media } = require("../model/Media");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

// Exact mapping between University slugs/names and uploaded PNG file names from user's folders
const TARGET_LOGO_MAP = [
  { slugs: ["edgewood"], fileNames: ["Edgewood University logo.png", "Edgewood.png", "Edgewood University logo.pngImage preview"] },
  { slugs: ["esgci"], fileNames: ["ESGCI logo.png", "ESGCI logo.pngImage preview"] },
  { slugs: ["rushford"], fileNames: ["Rushford Business School.png", "Rushford.png", "Rushford Business School.pngImage preview"] },
  { slugs: ["golden-gate", "ggu"], fileNames: ["Golden Gate University.png", "Golden Gate.png", "Golden Gate University.pngImage preview"] },
  { slugs: ["ssbm"], fileNames: ["SSBM Geneva.png", "SSBM Geneva.pngImage preview"] },
  { slugs: ["liverpool"], fileNames: ["Liverpool Business School.png", "Liverpool Business School.pngImage preview"] },
  { slugs: ["paris-school-of-business"], fileNames: ["Paris school of business.png", "Paris school of business.pngImage preview"] },
  { slugs: ["iim-udaipur"], fileNames: ["IIm udaipur.png", "IIm udaipur.pngImage preview"] },
  { slugs: ["iim-lucknow"], fileNames: ["IIM Lucknow.png", "IIM Lucknow.pngImage preview"] },
  { slugs: ["iit-roorkee"], fileNames: ["IIT roorkee.png", "IIT roorkee.pngImage preview"] },
  { slugs: ["iit-delhi"], fileNames: ["IIT delhi.png", "IIT delhi.pngImage preview"] },
  { slugs: ["iit-madras"], fileNames: ["IIT Madras.png", "IIT Madras.pngImage preview"] },
  { slugs: ["iim-kozhikode"], fileNames: ["IIM Kozhikode.png", "IIM Kozhikode.pngImage preview"] },
  { slugs: ["iim-bangalore", "iimb"], fileNames: ["IIMB.png", "IIMB.pngImage preview", "IIM Bangalore.png"] },
  { slugs: ["iim-nagpur"], fileNames: ["IIM nagpur.png", "IIM nagpur.pngImage preview"] },
  { slugs: ["iim-indore"], fileNames: ["IIM Indore.png", "IIM Indore.pngImage preview"] },
  { slugs: ["iiit-bangalore", "iiitb"], fileNames: ["IIIT Bangalore.png", "IIIT Bangalore.pngImage preview"] },
  { slugs: ["xlri"], fileNames: ["XLRI.png", "XLRI.pngImage preview"] }
];

async function linkLogos() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 Connected to MongoDB.");

    const universities = await University.find({ removed: false });
    const allMedia = await Media.find({ removed: false });

    console.log(`Found ${universities.length} universities and ${allMedia.length} media records in DB.`);

    let updatedCount = 0;

    for (const uni of universities) {
      const uniSlug = uni.slug.toLowerCase();

      // Find matching logo target config
      const targetConfig = TARGET_LOGO_MAP.find((item) =>
        item.slugs.some((s) => uniSlug.includes(s))
      );

      if (!targetConfig) {
        console.warn(`⚠️ [${uni.name}] (slug: ${uni.slug}) - No mapping entry found.`);
        continue;
      }

      // Search Media collection strictly for one of the target filenames
      let matchedMediaDoc = null;

      for (const targetName of targetConfig.fileNames) {
        const lowerTarget = targetName.toLowerCase();
        matchedMediaDoc = allMedia.find((m) => {
          const mName = (m.name || "").toLowerCase();
          const mAlt = (m.alt || "").toLowerCase();
          return mName === lowerTarget || mAlt === lowerTarget.replace(".png", "") || mName.startsWith(lowerTarget);
        });
        if (matchedMediaDoc) break;
      }

      // Secondary fallback: check if media name or alt includes the core university name & ends with .png
      if (!matchedMediaDoc) {
        const primarySlug = targetConfig.slugs[0];
        matchedMediaDoc = allMedia.find((m) => {
          const mName = (m.name || "").toLowerCase();
          const mAlt = (m.alt || "").toLowerCase();
          return (mName.endsWith(".png") || mAlt.includes(primarySlug)) && (mName.includes(primarySlug) || mAlt.includes(primarySlug));
        });
      }

      if (matchedMediaDoc) {
        uni.logoSrc = matchedMediaDoc._id;
        await uni.save();
        console.log(`✅ [${uni.name}] → Logo linked: "${matchedMediaDoc.name}" (${matchedMediaDoc._id}) | URL: ${matchedMediaDoc.url}`);
        updatedCount++;
      } else {
        console.warn(`⚠️ [${uni.name}] (slug: ${uni.slug}) - Logo media document not found for target files: ${targetConfig.fileNames.join(", ")}`);
      }
    }

    console.log(`\n🎉 Linking Complete! ${updatedCount}/${universities.length} universities updated with exact logoSrc.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error linking logos:", err);
    process.exit(1);
  }
}

linkLogos();

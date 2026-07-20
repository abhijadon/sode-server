"use strict";

/**
 * Generates mediaMap.json from MongoDB Media collection
 * Maps: original filename / local path -> MinIO public URL
 * Run: node src/seed/generateMediaMap.js
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const { Media } = require("../model/Media");

async function generateMediaMap() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sode";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log("📦 Fetching all Media records from MongoDB...");
    const mediaDocs = await Media.find({
      removed: false,
      enabled: true,
      url: /172\.236\.183\.64/,
    }).lean();

    console.log(`✅ Found ${mediaDocs.length} MinIO media documents.`);

    const mediaMap = {};

    for (const doc of mediaDocs) {
      const fileName = doc.name || doc.fileName;
      if (!fileName) continue;

      // Map by multiple keys for flexible lookup
      const keys = [
        // Direct filename
        fileName.toLowerCase(),
        // /assets/images/filename
        `/assets/images/${fileName}`,
        `/assets/images/${fileName.toLowerCase()}`,
        // /assets/pdf/filename (for PDFs)
        `/assets/pdf/${fileName}`,
        `/assets/pdf/${fileName.toLowerCase()}`,
      ];

      for (const key of keys) {
        if (!mediaMap[key]) {
          mediaMap[key] = doc.url;
        }
      }
    }

    const outputPath = path.resolve(
      __dirname,
      "../../../client/src/constants/mediaMap.json"
    );

    fs.writeFileSync(outputPath, JSON.stringify(mediaMap, null, 2), "utf-8");

    console.log(`🗺️ mediaMap.json written with ${Object.keys(mediaMap).length} entries.`);
    console.log(`📁 Output: ${outputPath}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ generateMediaMap error:", error);
    process.exit(1);
  }
}

generateMediaMap();

"use strict";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const { Media } = require("../model/Media");
const { SiteSetting } = require("../model/SiteSetting");
const { uploadFileToMinIO } = require("../service/minio/upload.service");

// Base path to client public images
const PUBLIC_IMAGES_DIR = path.resolve(
  __dirname,
  "../../../client/public/assets/images"
);

// Target static files to upload into MinIO & Media model
const targetMediaSeedFiles = [
  {
    fileName: "favicon.ico",
    alt: "SODE Favicon ICO",
    mimeType: "image/x-icon",
    key: "site/favicon.ico",
  },
  {
    fileName: "favicon.svg",
    alt: "SODE Favicon SVG",
    mimeType: "image/svg+xml",
    key: "site/favicon.svg",
  },
  {
    fileName: "favicon-96x96.png",
    alt: "SODE Favicon 96x96 PNG",
    mimeType: "image/png",
    key: "site/favicon-96x96.png",
  },
  {
    fileName: "apple-touch-icon.png",
    alt: "SODE Apple Touch Icon",
    mimeType: "image/png",
    key: "site/apple-touch-icon.png",
  },
  {
    fileName: "SODE-LOGO.png",
    alt: "SODE Official Logo",
    mimeType: "image/png",
    key: "site/sode-logo.png",
  },
  {
    fileName: "sode-homepage-og-card-image.png",
    alt: "SODE Homepage OG Card",
    mimeType: "image/png",
    key: "site/og-card-image.png",
  },
];

async function seedMediaAssets() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sode";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log("🚀 Starting MinIO & Mongoose Media Asset Seeding...");

    const uploadedMediaMap = {};

    for (const seedFile of targetMediaSeedFiles) {
      const filePath = path.join(PUBLIC_IMAGES_DIR, seedFile.fileName);
      let fileBuffer = null;
      let finalUrl = `/assets/images/${seedFile.fileName}`;
      let bucket = "images";
      let key = seedFile.key;

      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
        console.log(`📦 Attempting MinIO Upload for ${seedFile.fileName}...`);

        try {
          const uploadRes = await uploadFileToMinIO(
            fileBuffer,
            seedFile.fileName,
            seedFile.mimeType
          );
          if (uploadRes && uploadRes.url) {
            finalUrl = uploadRes.url;
            bucket = uploadRes.bucket;
            key = uploadRes.key;
            console.log(`✅ MinIO Upload Success: ${seedFile.fileName} ➔ ${finalUrl}`);
          }
        } catch (err) {
          console.warn(`⚠️ MinIO Upload Fallback for ${seedFile.fileName}:`, err.message);
        }
      }

      // Save / Update in Media collection
      const mediaDoc = await Media.findOneAndUpdate(
        { name: seedFile.fileName },
        {
          name: seedFile.fileName,
          alt: seedFile.alt,
          url: finalUrl,
          bucket: bucket,
          key: key,
          fileName: seedFile.fileName,
          mimeType: seedFile.mimeType,
          size: fileBuffer ? fileBuffer.length : 0,
          enabled: true,
          removed: false,
        },
        { upsert: true, new: true }
      );

      uploadedMediaMap[seedFile.fileName] = mediaDoc.url;
      console.log(`💾 Saved Media document: ${seedFile.fileName} (${mediaDoc.url})`);
    }

    // Update SiteSetting default record with new media URLs
    if (Object.keys(uploadedMediaMap).length > 0) {
      console.log("⚙️ Updating SiteSetting with Media URLs...");
      const updateData = {};
      if (uploadedMediaMap["favicon.ico"]) updateData.faviconIco = uploadedMediaMap["favicon.ico"];
      if (uploadedMediaMap["favicon.svg"]) updateData.faviconSvg = uploadedMediaMap["favicon.svg"];
      if (uploadedMediaMap["favicon-96x96.png"]) updateData.favicon96 = uploadedMediaMap["favicon-96x96.png"];
      if (uploadedMediaMap["apple-touch-icon.png"]) updateData.appleTouchIcon = uploadedMediaMap["apple-touch-icon.png"];
      if (uploadedMediaMap["sode-homepage-og-card-image.png"]) updateData.ogImage = uploadedMediaMap["sode-homepage-og-card-image.png"];

      await SiteSetting.findOneAndUpdate(
        { settingKey: "default_site_setting" },
        { ...updateData, enabled: true, removed: false },
        { upsert: true, new: true }
      );
      console.log("✅ SiteSettings updated with Media URLs!");
    }

    console.log("🎉 Media Seeding Complete!");
  } catch (error) {
    console.error("❌ Media Seed Error:", error);
  }
}

if (require.main === module) {
  seedMediaAssets().then(() => mongoose.connection.close());
}

module.exports = { seedMediaAssets };

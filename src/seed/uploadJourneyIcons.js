"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Media } = require("../model/Media");
const { uploadFileToMinIO } = require("../service/minio/upload.service");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const PUBLIC_DIR = path.resolve(__dirname, "../../../client/public");

const journeyIcons = [
  { file: "assets/images/icons/explore.svg", title: "Explore", description: "Discover programs that fit your career goals", color: "from-blue-500 to-indigo-600" },
  { file: "assets/images/icons/learn.svg", title: "Learn", description: "Join live classes & acquire modern skills", color: "from-emerald-500 to-teal-600" },
  { file: "assets/images/icons/certify.svg", title: "Certify", description: "Earn globally recognized certifications", color: "from-amber-500 to-orange-600" },
  { file: "assets/images/icons/succeed.svg", title: "Succeed", description: "Get placed & grow your career trajectory", color: "from-purple-500 to-pink-600" },
];

async function uploadIcons() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    const uploadedSteps = [];

    for (let i = 0; i < journeyIcons.length; i++) {
      const icon = journeyIcons[i];
      const fullPath = path.join(PUBLIC_DIR, icon.file);
      const originalName = path.basename(fullPath);
      const fileBuffer = fs.readFileSync(fullPath);

      const uploadRes = await uploadFileToMinIO(fileBuffer, originalName, "image/svg+xml");

      const media = await Media.create({
        name: originalName,
        alt: `${icon.title} Step Icon`,
        url: uploadRes.url,
        bucket: uploadRes.bucket,
        key: uploadRes.key,
        fileName: uploadRes.fileName,
        mimeType: "image/svg+xml",
        size: fileBuffer.length,
        enabled: true,
        removed: false,
      });

      console.log(`✅ Uploaded MinIO Media: ${originalName} -> ${uploadRes.url}`);

      uploadedSteps.push({
        number: String(i + 1),
        title: icon.title,
        description: icon.description,
        iconUrl: uploadRes.url,
        color: icon.color,
      });
    }

    console.log("\n📦 Uploaded Journey Steps JSON:");
    console.log(JSON.stringify(uploadedSteps, null, 2));
  } catch (err) {
    console.error("❌ Error uploading icons:", err);
  } finally {
    await mongoose.disconnect();
  }
}

uploadIcons();

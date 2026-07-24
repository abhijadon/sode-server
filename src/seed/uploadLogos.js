"use strict";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { Media } = require("../model/Media");
const { uploadFileToMinIO } = require("../service/minio/upload.service");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const DIRS_TO_UPLOAD = [
  path.resolve(__dirname, "../../../client/public/assets/Logos png file"),
  path.resolve(__dirname, "../../../client/public/assets/tinified (10)"),
];

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

async function uploadLogosAndAssets() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    let totalUploaded = 0;
    let totalFailed = 0;

    for (const targetDir of DIRS_TO_UPLOAD) {
      if (!fs.existsSync(targetDir)) {
        console.warn(`⚠️ Directory not found: ${targetDir}`);
        continue;
      }

      const dirName = path.basename(targetDir);
      console.log(`\n📁 Scanning folder: "${dirName}"...`);

      const files = fs.readdirSync(targetDir);
      const mediaFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext);
      });

      console.log(`   Found ${mediaFiles.length} media files.`);

      for (let i = 0; i < mediaFiles.length; i++) {
        const fileName = mediaFiles[i];
        const fullPath = path.join(targetDir, fileName);
        const mimeType = getMimeType(fullPath);
        const fileBuffer = fs.readFileSync(fullPath);

        console.log(`   [${i + 1}/${mediaFiles.length}] Uploading asset: ${fileName}...`);

        try {
          const uploadRes = await uploadFileToMinIO(
            fileBuffer,
            fileName,
            mimeType
          );

          const altText = fileName
            .replace(path.extname(fileName), "")
            .replace(/[-_]/g, " ");

          const mediaDoc = await Media.findOneAndUpdate(
            { name: fileName },
            {
              name: fileName,
              alt: altText,
              url: uploadRes.url,
              bucket: uploadRes.bucket,
              key: uploadRes.key,
              fileName: uploadRes.fileName,
              mimeType: uploadRes.mimeType,
              size: fileBuffer.length,
              enabled: true,
              removed: false,
            },
            { upsert: true, returnDocument: "after" }
          );

          console.log(`      ✅ MinIO URL: ${uploadRes.url}`);
          console.log(`      ✅ Media ID: ${mediaDoc._id}`);
          totalUploaded++;
        } catch (err) {
          console.error(`      ❌ Failed to upload ${fileName}:`, err.message);
          totalFailed++;
        }
      }
    }

    console.log(`\n🎉 UPLOAD COMPLETE!`);
    console.log(`✅ Uploaded Successfully: ${totalUploaded}`);
    console.log(`❌ Failed: ${totalFailed}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Asset Seed Error:", error);
    process.exit(1);
  }
}

uploadLogosAndAssets();

"use strict";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const { Media } = require("../model/Media");
const { uploadFileToMinIO } = require("../service/minio/upload.service");

// Root path to client public directory
const PUBLIC_DIR = path.resolve(__dirname, "../../../client/public");

// Helper to determine mime type from file extension
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
    case ".ico":
      return "image/x-icon";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

// Recursively find all files in directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function uploadAllPublicAssets() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sode";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log(`🚀 Scanning public directory: ${PUBLIC_DIR}`);
    const allFilePaths = getAllFiles(PUBLIC_DIR);

    // Filter relevant media & pdf files
    const mediaFiles = allFilePaths.filter((fp) => {
      const ext = path.extname(fp).toLowerCase();
      return [".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".gif", ".pdf"].includes(ext);
    });

    console.log(`📁 Found ${mediaFiles.length} media & document files to upload.`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < mediaFiles.length; i++) {
      const filePath = mediaFiles[i];
      const fileName = path.basename(filePath);
      const mimeType = getMimeType(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      const relativePath = path.relative(PUBLIC_DIR, filePath);

      console.log(`[${i + 1}/${mediaFiles.length}] Uploading: ${relativePath}...`);

      try {
        const uploadRes = await uploadFileToMinIO(
          fileBuffer,
          fileName,
          mimeType
        );

        const altText = fileName
          .replace(path.extname(fileName), "")
          .replace(/[-_]/g, " ");

        // Save / update record in Mongoose Media collection
        await Media.findOneAndUpdate(
          { fileName: uploadRes.fileName },
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
          { upsert: true, new: true }
        );

        console.log(`   ✅ MinIO URL: ${uploadRes.url}`);
        successCount++;
      } catch (err) {
        console.error(`   ❌ Failed ${fileName}:`, err.message);
        failCount++;
      }
    }

    console.log(`\n🎉 BULK UPLOAD COMPLETE!`);
    console.log(`✅ Uploaded Successfully: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Bulk Media Seed Error:", error);
    process.exit(1);
  }
}

uploadAllPublicAssets();

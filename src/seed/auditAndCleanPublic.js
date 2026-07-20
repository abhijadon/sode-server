"use strict";

/**
 * Complete audit + cleanup script:
 * 1. Finds ALL files still in public/assets/
 * 2. Uploads any NOT already in MinIO
 * 3. Regenerates mediaMap.json
 * 4. Deletes files from public/assets/
 *
 * Run: node src/seed/auditAndCleanPublic.js
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { Media } = require("../model/Media");

// ─── MinIO Config ────────────────────────────────────────────────────────────
const MINIO_ENDPOINT =
  process.env.MINIO_ENDPOINT || "http://172.236.183.64:9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "admin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "this password123";
const MINIO_PUBLIC_URL = MINIO_ENDPOINT;

// ─── Bucket helper ───────────────────────────────────────────────────────────
function getBucket(mimeType = "", ext = "") {
  const e = ext.toLowerCase();
  if (mimeType.startsWith("image/")) return "images";
  if (mimeType.startsWith("video/")) return "videos";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    e === ".pdf" ||
    e === ".doc" ||
    e === ".docx" ||
    e === ".xls" ||
    e === ".xlsx" ||
    e === ".ppt" ||
    e === ".pptx"
  )
    return "documents";
  return "uploads";
}

function getMime(ext = "") {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".avif": "image/avif",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

// ─── S3 Client ───────────────────────────────────────────────────────────────
const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: { accessKeyId: MINIO_ACCESS_KEY, secretAccessKey: MINIO_SECRET_KEY },
  forcePathStyle: true,
});

async function objectExists(bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ─── Walk directory ───────────────────────────────────────────────────────────
function walkDir(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (entry.name !== ".DS_Store") {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected\n");

  const publicAssetsDir = path.resolve(
    __dirname,
    "../../../client/public/assets"
  );
  const allFiles = walkDir(publicAssetsDir);

  console.log(`📁 Found ${allFiles.length} files in public/assets/\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const failedFiles = [];

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);
    const mimeType = getMime(ext);
    const bucket = getBucket(mimeType, ext);

    // Check if already in Media collection by name
    const existingMedia = await Media.findOne({
      name: fileName,
      removed: false,
    }).lean();

    if (existingMedia && existingMedia.url) {
      // Already uploaded, skip
      skipped++;
      continue;
    }

    // Build MinIO key
    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const safeFileName = fileName.replace(/\s+/g, "-").replace(/[()]/g, "");
    const key = `${datePath}/${safeFileName}`;

    try {
      const fileBuffer = fs.readFileSync(filePath);

      // Check if key exists in MinIO
      const exists = await objectExists(bucket, key);
      let finalKey = key;
      if (exists) {
        // Add timestamp suffix
        finalKey = `${datePath}/${Date.now()}-${safeFileName}`;
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: finalKey,
          Body: fileBuffer,
          ContentType: mimeType,
          ContentLength: fileBuffer.length,
        })
      );

      const minioUrl = `${MINIO_PUBLIC_URL}/${bucket}/${finalKey}`;

      // Save to Media collection
      await Media.create({
        name: fileName,
        fileName: safeFileName,
        url: minioUrl,
        mimeType,
        size: fileBuffer.length,
        bucket,
        key: finalKey,
        alt: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        enabled: true,
        removed: false,
      });

      console.log(`✅ Uploaded: ${fileName} → ${bucket}/${finalKey}`);
      uploaded++;
    } catch (err) {
      console.error(`❌ Failed: ${fileName} — ${err.message}`);
      failed++;
      failedFiles.push({ file: fileName, error: err.message });
    }
  }

  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ⏭️  Skipped (already in MinIO): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);

  // ─── Regenerate mediaMap.json ──────────────────────────────────────────────
  console.log("\n🗺️  Regenerating mediaMap.json...");
  const mediaDocs = await Media.find({
    removed: false,
    enabled: true,
    url: /172\.236\.183\.64/,
  }).lean();

  const mediaMap = {};
  for (const doc of mediaDocs) {
    const name = doc.name || doc.fileName;
    if (!name) continue;
    const keys = [
      name.toLowerCase(),
      `/assets/images/${name}`,
      `/assets/images/${name.toLowerCase()}`,
      `/assets/pdf/${name}`,
      `/assets/pdf/${name.toLowerCase()}`,
    ];
    for (const k of keys) {
      if (!mediaMap[k]) mediaMap[k] = doc.url;
    }
  }

  const mapOutputPath = path.resolve(
    __dirname,
    "../../../client/src/constants/mediaMap.json"
  );
  fs.writeFileSync(mapOutputPath, JSON.stringify(mediaMap, null, 2), "utf-8");
  console.log(`✅ mediaMap.json updated: ${Object.keys(mediaMap).length} entries`);

  // ─── Delete public/assets/ files (only if no failures) ────────────────────
  if (failed === 0) {
    console.log(
      "\n🗑️  Deleting public/assets/images and public/assets/pdf folders..."
    );
    const imagesToDelete = walkDir(
      path.join(publicAssetsDir, "images")
    );
    const pdfsToDelete = walkDir(
      path.join(publicAssetsDir, "pdf")
    );
    const allToDelete = [...imagesToDelete, ...pdfsToDelete];

    for (const f of allToDelete) {
      try {
        fs.unlinkSync(f);
      } catch {}
    }

    // Remove empty dirs
    try {
      fs.rmSync(path.join(publicAssetsDir, "images"), { recursive: true, force: true });
      fs.rmSync(path.join(publicAssetsDir, "pdf"), { recursive: true, force: true });
      console.log(`✅ Deleted ${allToDelete.length} files from public/assets/`);
    } catch (e) {
      console.log("⚠️  Could not remove dirs:", e.message);
    }
  } else {
    console.log(
      `\n⚠️  Skipping deletion — ${failed} uploads failed. Fix errors and re-run.`
    );
    console.log("Failed files:", failedFiles);
  }

  await mongoose.connection.close();
  console.log("\n🎉 Done!");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});

"use strict";

const crypto = require("crypto");
const path = require("path");

const { PutObjectCommand, CreateBucketCommand, HeadBucketCommand } = require("@aws-sdk/client-s3");

const { minioClient } = require("./client.service");

const { getBucketByMimeType, generateFolderPath } = require("./bucket.service");

async function ensureBucketExists(bucketName) {
  try {
    await minioClient.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (err) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404 || err.Code === "NoSuchBucket") {
      try {
        await minioClient.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`✅ MinIO Bucket created: ${bucketName}`);
      } catch (createErr) {
        console.warn(`⚠️ MinIO CreateBucket warning for ${bucketName}:`, createErr.message);
      }
    }
  }
}

async function uploadFileToMinIO(fileBuffer, originalName, mimeType, bucketOverride = null) {
  try {
    const bucketName = bucketOverride || getBucketByMimeType(mimeType);

    await ensureBucketExists(bucketName);

    const folder = generateFolderPath();

    const extension = path.extname(originalName);

    const fileName = crypto.randomBytes(16).toString("hex") + extension;

    const key = `${folder}/${fileName}`;

    await minioClient.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );

    const publicUrl =
      process.env.MINIO_PUBLIC_URL || "http://172.236.183.64:9000";

    return {
      success: true,

      bucket: bucketName,

      key,

      fileName,

      mimeType,

      url: `${publicUrl}/${bucketName}/${key}`,
    };
  } catch (error) {
    console.error("❌ MinIO Upload Error:", error);

    throw new Error(`MinIO upload failed: ${error.message}`);
  }
}

module.exports = {
  uploadFileToMinIO,
};

"use strict";

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { minioClient } = require("./client.service");

/**
 * Generate temporary download/view URL
 *
 * @param {string} bucket
 * @param {string} key
 * @param {number} expiresIn Seconds (default 1 hour)
 */
async function generatePresignedUrl(bucket, key, expiresIn = 3600) {
  if (!bucket) {
    throw new Error("Bucket name is required");
  }

  if (!key) {
    throw new Error("File key is required");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(minioClient, command, {
      expiresIn,
    });

    return {
      success: true,
      bucket,
      key,
      expiresIn,
      url: signedUrl,
    };
  } catch (error) {
    console.error("❌ MinIO Presigned URL Error:", error);

    throw new Error("Failed to generate presigned URL");
  }
}

module.exports = {
  generatePresignedUrl,
};

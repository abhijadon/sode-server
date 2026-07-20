"use strict";

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { minioClient } = require("./client.service");

async function deleteFileFromMinIO(bucket, key) {
  if (!bucket) {
    throw new Error("Bucket name is required");
  }

  if (!key) {
    throw new Error("File key is required");
  }

  try {
    await minioClient.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    return {
      success: true,
      bucket,
      key,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("❌ MinIO Delete Error:", error);

    throw new Error(`MinIO delete failed: ${error.message}`);
  }
}

module.exports = {
  deleteFileFromMinIO,
};

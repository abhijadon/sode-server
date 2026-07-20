"use strict";

const {
  CreateBucketCommand,
  ListBucketsCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} = require("@aws-sdk/client-s3");
const { minioClient } = require("./client.service");

const MINIO_ENDPOINT =
  process.env.MINIO_ENDPOINT || "http://172.236.183.64:9000";

/**
 * List all MinIO buckets
 */
async function listBuckets() {
  const res = await minioClient.send(new ListBucketsCommand({}));
  return (res.Buckets || []).map((b) => ({
    name: b.Name,
    createdAt: b.CreationDate,
    publicUrl: `${MINIO_ENDPOINT}/${b.Name}`,
  }));
}

/**
 * Create a new MinIO bucket with public read policy
 */
async function createBucket(bucketName) {
  const safeName = bucketName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!safeName || safeName.length < 3) {
    throw new Error("Bucket name must be at least 3 characters (a-z, 0-9, -)");
  }

  // Check if already exists
  try {
    await minioClient.send(new HeadBucketCommand({ Bucket: safeName }));
    return { name: safeName, existed: true };
  } catch (err) {
    if (err.$metadata?.httpStatusCode !== 404 && err.name !== "NoSuchBucket" && err.name !== "NotFound") {
      throw err;
    }
  }

  // Create bucket
  await minioClient.send(new CreateBucketCommand({ Bucket: safeName }));

  // Set public read policy
  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${safeName}/*`],
      },
    ],
  });

  await minioClient.send(
    new PutBucketPolicyCommand({ Bucket: safeName, Policy: policy })
  );

  return { name: safeName, existed: false };
}

module.exports = { listBuckets, createBucket };

"use strict";

require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");

const minioClient = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://172.236.183.64:9000",
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

module.exports = { minioClient };

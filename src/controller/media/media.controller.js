"use strict";

const { Media } = require("../../model/Media");
const { uploadFileToMinIO } = require("../../service/minio/upload.service");
const { deleteFileFromMinIO } = require("../../service/minio/delete.service");
const { generatePresignedUrl } = require("../../service/minio/presigned.service");
const { listBuckets, createBucket } = require("../../service/minio/adminBucket.service");

const uploadMedia = async (request, reply) => {
  try {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileBuffer = await data.toBuffer();
    const originalName = data.filename || "file";
    const mimeType = data.mimetype || "application/octet-stream";
    const altText = data.fields?.alt?.value || originalName;
    const customName = data.fields?.name?.value || originalName;
    // Allow bucket override from form field
    const bucketOverride = data.fields?.bucket?.value || null;

    // Upload file to MinIO storage bucket
    const uploadResult = await uploadFileToMinIO(
      fileBuffer,
      originalName,
      mimeType,
      bucketOverride
    );

    // Save document details to MongoDB Media collection
    const mediaRecord = new Media({
      name: customName,
      alt: altText,
      url: uploadResult.url,
      bucket: uploadResult.bucket,
      key: uploadResult.key,
      fileName: uploadResult.fileName,
      mimeType: uploadResult.mimeType,
      size: fileBuffer.length,
      createdBy: request.user?._id || null,
    });

    const savedMedia = await mediaRecord.save();

    return reply.code(200).send({
      success: true,
      result: savedMedia,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Media Upload Controller Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Failed to upload media",
      error: error.message,
    });
  }
};

const deleteMedia = async (request, reply) => {
  try {
    const { id } = request.params;

    const media = await Media.findById(id);
    if (!media) {
      return reply.code(404).send({
        success: false,
        message: "Media record not found",
      });
    }

    // Delete file object from MinIO bucket
    try {
      await deleteFileFromMinIO(media.bucket, media.key);
    } catch (err) {
      console.warn("⚠️ MinIO File deletion warning:", err.message);
    }

    // Mark media document as removed in MongoDB
    media.removed = true;
    media.removedAt = new Date();
    await media.save();

    return reply.code(200).send({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Media Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Failed to delete media",
      error: error.message,
    });
  }
};

const getPresignedMediaUrl = async (request, reply) => {
  try {
    const { id } = request.params;

    const media = await Media.findById(id);
    if (!media) {
      return reply.code(404).send({
        success: false,
        message: "Media record not found",
      });
    }

    const presigned = await generatePresignedUrl(media.bucket, media.key, 3600);

    return reply.code(200).send({
      success: true,
      result: presigned,
      message: "Presigned URL generated successfully",
    });
  } catch (error) {
    console.error("❌ Presigned URL Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Failed to generate presigned URL",
      error: error.message,
    });
  }
};

const getBucketList = async (request, reply) => {
  try {
    const buckets = await listBuckets();
    return reply.code(200).send({ success: true, result: buckets });
  } catch (error) {
    console.error("❌ List Buckets Error:", error);
    return reply.code(500).send({ success: false, message: error.message });
  }
};

const createNewBucket = async (request, reply) => {
  try {
    const { name } = request.body;
    if (!name) {
      return reply.code(400).send({ success: false, message: "Bucket name is required" });
    }
    const result = await createBucket(name);
    return reply.code(200).send({
      success: true,
      result,
      message: result.existed
        ? `Bucket "${result.name}" already exists`
        : `Bucket "${result.name}" created successfully`,
    });
  } catch (error) {
    console.error("❌ Create Bucket Error:", error);
    return reply.code(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  uploadMedia,
  deleteMedia,
  getPresignedMediaUrl,
  getBucketList,
  createNewBucket,
};

"use strict";

const BUCKETS = {
  IMAGES: "images",
  VIDEOS: "videos",
  AUDIO: "audio",
  DOCUMENTS: "documents",
  UPLOADS: "uploads",
};

function getBucketByMimeType(mimeType = "") {
  if (mimeType.startsWith("image/")) {
    return BUCKETS.IMAGES;
  }

  if (mimeType.startsWith("video/")) {
    return BUCKETS.VIDEOS;
  }

  if (mimeType.startsWith("audio/")) {
    return BUCKETS.AUDIO;
  }

  return BUCKETS.UPLOADS;
}

function generateFolderPath() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

module.exports = {
  BUCKETS,
  getBucketByMimeType,
  generateFolderPath,
};

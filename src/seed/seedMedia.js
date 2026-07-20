"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { Media } = require("../model/Media");
const { Course } = require("../model/Course");
const { University } = require("../model/University");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

function getFileName(url) {
  if (!url) return "file";
  const parts = url.split("/");
  return parts[parts.length - 1] || "file";
}

async function findOrCreateMedia(url, defaultName = "Media Asset") {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  let media = await Media.findOne({ url: cleanUrl });
  if (!media) {
    const fileName = getFileName(cleanUrl);
    const mimeType = fileName.endsWith(".png")
      ? "image/png"
      : fileName.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    media = await Media.create({
      name: defaultName || fileName,
      alt: defaultName || fileName,
      url: cleanUrl,
      bucket: "public-assets",
      key: `assets/${fileName}`,
      fileName,
      mimeType,
      size: 1024,
      enabled: true,
    });
    console.log(`✅ Created Media document: ${media.name} (${media._id}) -> ${cleanUrl}`);
  }
  return media._id;
}

async function seedMediaAndMigrateReferences() {
  try {
    console.log("🍃 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("🔄 Processing University logoSrc and imageSrc...");
    const universities = await University.find({}).lean();
    for (const uni of universities) {
      const updates = {};
      if (uni.logoSrc && typeof uni.logoSrc === "string") {
        const logoId = await findOrCreateMedia(uni.logoSrc, `${uni.name} Logo`);
        if (logoId) updates.logoSrc = logoId;
      }
      if (uni.imageSrc && typeof uni.imageSrc === "string") {
        const imageId = await findOrCreateMedia(uni.imageSrc, `${uni.name} Campus`);
        if (imageId) updates.imageSrc = imageId;
      }
      if (Object.keys(updates).length > 0) {
        await University.updateOne({ _id: uni._id }, { $set: updates });
        console.log(`✅ Updated University "${uni.name}" with Media ObjectIds.`);
      }
    }

    console.log("🔄 Processing Course image and logo...");
    const courses = await Course.find({}).lean();
    for (const course of courses) {
      const updates = {};
      if (course.image && typeof course.image === "string") {
        const imgId = await findOrCreateMedia(course.image, `${course.title} Image`);
        if (imgId) updates.image = imgId;
      }
      if (course.logo && typeof course.logo === "string") {
        const logoId = await findOrCreateMedia(course.logo, `${course.title} Logo`);
        if (logoId) updates.logo = logoId;
      }
      if (Object.keys(updates).length > 0) {
        await Course.updateOne({ _id: course._id }, { $set: updates });
        console.log(`✅ Updated Course "${course.title}" with Media ObjectIds.`);
      }
    }

    console.log("\n🎉 All static media paths converted to dynamic Media ObjectIds!");
  } catch (error) {
    console.error("❌ Error seeding media:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

seedMediaAndMigrateReferences();
